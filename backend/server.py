from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
import io
import os
import replicate
import requests
import base64
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager

load_dotenv()

REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

# Token'ı environment variable olarak set et (Replicate client bundan okur)
if REPLICATE_API_TOKEN:
    os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN
    # Replicate client'ı token ile başlat
    replicate_client = replicate.Client(api_token=REPLICATE_API_TOKEN)
    print(f"✅ Replicate API Token yüklendi: {REPLICATE_API_TOKEN[:10]}...")
else:
    print("❌ UYARI: REPLICATE_API_TOKEN bulunamadı!")
    print("   .env dosyasını kontrol edin.")
    replicate_client = replicate.Client()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config["JWT_SECRET_KEY"] = "super-secret-key-change-it-later"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db" 

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    credits = db.Column(db.Integer, nullable=False, default=10)

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', None)
    password = data.get('password', None)
    if not email or not password: 
        return jsonify({"msg": "E-posta ve şifre gerekli"}), 400
    if User.query.filter_by(email=email).first(): 
        return jsonify({"msg": "Bu e-posta adresi zaten kullanılıyor"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "Kullanıcı başarıyla oluşturuldu"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', None)
    password = data.get('password', None)
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, credits=user.credits)
    return jsonify({"msg": "E-posta veya şifre hatalı"}), 401
    
@app.route('/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id) 
    if user: 
        return jsonify(credits=user.credits, email=user.email)
    return jsonify({"msg": "Kullanıcı bulunamadı"}), 404


@app.route('/api/transform', methods=['POST'])
@jwt_required()
def transform_image():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id) 

    if user.credits <= 0:
        return jsonify({"msg": "Yeterli krediniz bulunmamaktadır."}), 403 

    if 'file' not in request.files:
        return jsonify({"msg": "Dosya bulunamadı"}), 400

    file = request.files['file']
    gender = request.form.get('gender', 'female')
    background = request.form.get('background', 'neutral')

    if file.filename == '':
        return jsonify({"msg": "Dosya seçilmedi"}), 400

    try:
        print(f"🤖 Replicate çağrılıyor, Gender: {gender}, Background: {background}")

        file_bytes = file.read()
        file_base64 = base64.b64encode(file_bytes).decode('utf-8')
        mime_type = file.content_type or 'image/png'
        data_uri = f"data:{mime_type};base64,{file_base64}"

        print(f"📤 Data URI hazırlandı (uzunluk: {len(data_uri)} karakter)")


        print("🎯 flux-kontext-apps/professional-headshot kullanılıyor")
        output = replicate_client.run(
            "flux-kontext-apps/professional-headshot:7b1fede524c232d57b50f681b828f6b8867b161df349aca1c0c4f747b1f4225c",
            input={
                "gender": gender,
                "background": background,
                "input_image": data_uri,
                "aspect_ratio": "1:1",
                "output_format": "png",
                "safety_tolerance": 2
            }
        )
        print("✅ Professional headshot başarılı!")
        
        print(f"✅ Replicate yanıtı alındı: {type(output)}")
        
        # Flux-dev bir liste döndürür [FileOutput, ...]
        if isinstance(output, list) and len(output) > 0:
            file_output = output[0]
            print(f"📦 FileOutput objesi alındı: {type(file_output)}")
            
            
            img_data = file_output.read()
            img_io = io.BytesIO(img_data)
            img_io.seek(0)
            
            user.credits -= 1
            db.session.commit()
            
            print(f"✅ İşlem başarılı! Kullanıcı: {user.email}, Kalan Kredi: {user.credits}")
            return send_file(img_io, mimetype='image/png')
        
    
        elif hasattr(output, 'read'):
            img_data = output.read()
            img_io = io.BytesIO(img_data)
            img_io.seek(0)
            
            user.credits -= 1
            db.session.commit()
            
            print(f"✅ İşlem başarılı! Kullanıcı: {user.email}, Kalan Kredi: {user.credits}")
            return send_file(img_io, mimetype='image/png')
        
     
        elif isinstance(output, str):
            print(f"📥 URL'den resim indiriliyor: {output}")
            response = requests.get(output)
            img_io = io.BytesIO(response.content)
            img_io.seek(0)
        else:
            raise Exception(f"Beklenmeyen output formatı: {type(output)}")
        
        user.credits -= 1
        db.session.commit()
        
        print(f"✅ İşlem başarılı. Kullanıcı: {user.email}, Kalan Kredi: {user.credits}")
        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        print(f"❌ GENEL HATA: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": "Sunucuda hata oluştu.", "error": str(e)}), 500

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
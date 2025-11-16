import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginForm = ({ setAuthToken, setView, setCredits }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:5000/auth/login', { email, password });
            const { access_token, credits } = response.data;
            localStorage.setItem('authToken', access_token);
            setAuthToken(access_token);
            setCredits(credits);
            setView('app');
        } catch (err) {
            setError(err.response?.data?.msg || 'Giriş yapılamadı.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Giriş Yap</h2>
                <p className="auth-subtitle">Profesyonel fotoğraflarını oluştur</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta"
                        required
                        className="auth-input"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre"
                        required
                        className="auth-input"
                    />
                    <button type="submit" className="auth-button">Giriş Yap</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="auth-switch">
                    Hesabın yok mu?
                    <span onClick={() => setView('register')} className="auth-link"> Kayıt Ol</span>
                </p>
            </div>
        </div>
    );
};

const RegisterForm = ({ setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('http://127.0.0.1:5000/auth/register', { email, password });
            setSuccess('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            setTimeout(() => setView('login'), 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Kayıt başarısız oldu.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Kayıt Ol</h2>
                <p className="auth-subtitle">🎁 Kayıt olunca 10 ücretsiz kredi kazan!</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta"
                        required
                        className="auth-input"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre (min 6 karakter)"
                        required
                        className="auth-input"
                    />
                    <button type="submit" className="auth-button">Kayıt Ol</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <p className="auth-switch">
                    Zaten hesabın var mı?
                    <span onClick={() => setView('login')} className="auth-link"> Giriş Yap</span>
                </p>
            </div>
        </div>
    );
};

function ImageUploader() {
    const [view, setView] = useState('login');
    const [authToken, setAuthToken] = useState(null);
    const [credits, setCredits] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gender, setGender] = useState('male');
    const [background, setBackground] = useState('neutral');
    const [isLoading, setIsLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await axios.get('http://127.0.0.1:5000/auth/profile', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setCredits(response.data.credits);
                    setAuthToken(token);
                    setView('app');
                } catch (error) {
                    localStorage.removeItem('authToken');
                    setAuthToken(null);
                    setView('login');
                }
            } else {
                setView('login');
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResultImage(null);
            setErrorMessage('');
        }
    };

    const handleTransform = async () => {
        if (!selectedFile || !authToken) return;
        setIsLoading(true);
        setErrorMessage('');
        setResultImage(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('gender', gender);
        formData.append('background', background);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/transform', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`
                },
                responseType: 'blob',
            });

            const resultImageUrl = URL.createObjectURL(response.data);
            setResultImage(resultImageUrl);
            setCredits(prevCredits => prevCredits - 1);
        } catch (error) {
            console.error('Hata:', error);
            const errData = error.response?.data ? await error.response.data.text() : "{}";
            let errMsg;
            try {
                errMsg = JSON.parse(errData).msg || "Resim oluşturulurken bir hata oluştu.";
            } catch (e) {
                errMsg = error.response?.statusText || "Sunucu hatası.";
            }
            setErrorMessage(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setCredits(null);
        setView('login');
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'professional-headshot.png';
        link.click();
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreview(null);
        setResultImage(null);
        setErrorMessage('');
    };

    if (!authToken) {
        if (view === 'register') {
            return <RegisterForm setView={setView} />;
        }
        return <LoginForm setAuthToken={setAuthToken} setView={setView} setCredits={setCredits} />;
    }

    if (credits === null) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">✨ AI Profesyonel Fotoğraf Stüdyosu</h1>
                <div className="header-actions">
                    <div className="credits-badge">
                        💳 <strong>{credits}</strong> Kredi
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Çıkış Yap
                    </button>
                </div>
            </header>

            <div className="main-content">
                <div className="upload-section">
                    <div className="section-card">
                        <h2 className="section-title">1️⃣ Fotoğrafını Yükle</h2>
                        <div className="upload-area">
                            {preview ? (
                                <div className="preview-container">
                                    <img src={preview} alt="Önizleme" className="preview-image" />
                                    <button onClick={handleReset} className="reset-btn">
                                        🔄 Yeni Fotoğraf Seç
                                    </button>
                                </div>
                            ) : (
                                <label className="upload-label">
                                    <div className="upload-content">
                                        <div className="upload-icon">📸</div>
                                        <p className="upload-text">Fotoğraf yüklemek için tıkla</p>
                                        <p className="upload-hint">Yüzünün net göründüğü bir fotoğraf seç</p>
                                    </div>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/png, image/jpeg"
                                        className="file-input"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {preview && (
                        <div className="section-card">
                            <h2 className="section-title">2️⃣ Ayarları Seç</h2>

                            <div className="settings-group">
                                <label className="setting-label">Cinsiyet</label>
                                <div className="button-group">
                                    <button
                                        type="button"
                                        className={`option-btn ${gender === 'male' ? 'active' : ''}`}
                                        onClick={() => setGender('male')}
                                    >
                                        👨 Erkek
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-btn ${gender === 'female' ? 'active' : ''}`}
                                        onClick={() => setGender('female')}
                                    >
                                        👩 Kadın
                                    </button>
                                </div>
                            </div>

                            <div className="settings-group">
                                <label className="setting-label">Arka Plan</label>
                                <div className="button-group-grid">
                                    <button
                                        type="button"
                                        className={`option-btn ${background === 'neutral' ? 'active' : ''}`}
                                        onClick={() => setBackground('neutral')}
                                    >
                                        ⚪ Nötr
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-btn ${background === 'office' ? 'active' : ''}`}
                                        onClick={() => setBackground('office')}
                                    >
                                        🏢 Ofis
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-btn ${background === 'outdoor' ? 'active' : ''}`}
                                        onClick={() => setBackground('outdoor')}
                                    >
                                        🌳 Dış Mekan
                                    </button>
                                    <button
                                        type="button"
                                        className={`option-btn ${background === 'studio' ? 'active' : ''}`}
                                        onClick={() => setBackground('studio')}
                                    >
                                        📷 Stüdyo
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="generate-btn"
                                onClick={handleTransform}
                                disabled={isLoading || credits <= 0}
                            >
                                {isLoading ? '⏳ Oluşturuluyor...' : '✨ Profesyonel Fotoğraf Oluştur (1 Kredi)'}
                            </button>

                            {credits <= 0 && (
                                <p className="warning-message">⚠️ Yeterli krediniz yok</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="result-section">
                    <div className="section-card result-card">
                        <h2 className="section-title">3️⃣ Sonuç</h2>

                        {isLoading && (
                            <div className="loading-result">
                                <div className="spinner"></div>
                                <p className="loading-text">Profesyonel fotoğrafın hazırlanıyor...</p>
                                <p className="loading-hint">Bu işlem 10-30 saniye sürebilir</p>
                            </div>
                        )}

                        {!isLoading && errorMessage && (
                            <div className="error-result">
                                <div className="error-icon">❌</div>
                                <p className="error-title">Bir hata oluştu</p>
                                <p className="error-detail">{errorMessage}</p>
                            </div>
                        )}

                        {!isLoading && !errorMessage && resultImage && (
                            <div className="success-result">
                                <div className="result-image-container">
                                    <img src={resultImage} alt="Sonuç" className="result-image" />
                                </div>
                                <div className="result-actions">
                                    <button onClick={handleDownload} className="download-btn">
                                        💾 İndir
                                    </button>
                                    <button onClick={handleReset} className="new-btn">
                                        🔄 Yeni Fotoğraf
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !errorMessage && !resultImage && (
                            <div className="empty-result">
                                <div className="empty-icon">🖼️</div>
                                <p className="empty-text">Fotoğrafını yükle ve ayarları seç</p>
                                <p className="empty-hint">Sonucun burada görünecek</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageUploader;
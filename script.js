(function () {
    const authContainer = document.getElementById('authContainer');
    const aiSection = document.getElementById('aiGeneratorSection');

    const loginDiv = document.getElementById('loginFormDiv');
    const signupDiv = document.getElementById('signupFormDiv');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showSignupBtn = document.getElementById('showSignupBtn');

    const loginEmail = document.getElementById('loginEmailInput');
    const loginPass = document.getElementById('loginPassInput');
    const signupEmail = document.getElementById('signupEmailInput');
    const signupPass = document.getElementById('signupPassInput');

    const loginBtn = document.getElementById('loginActionBtn');
    const signupBtn = document.getElementById('signupActionBtn');
    const authMessageSpan = document.getElementById('authMessage');

    const promptField = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateImageBtn');
    const imageBox = document.getElementById('imageDisplayBox');


    function setAuthMessage(msg, isError = false) {
        authMessageSpan.innerHTML = msg;
        authMessageSpan.style.color = isError ? '#ffb4a2' : '#b9fbc0';
        setTimeout(() => {
            if (authMessageSpan.innerHTML === msg) {
                authMessageSpan.innerHTML = '';
                authMessageSpan.style.color = '#e2e8f0';
            }
        }, 2800);
    }

    showLoginBtn.onclick = () => {
        loginDiv.classList.remove('hide');
        signupDiv.classList.add('hide');
        authMessageSpan.innerHTML = '';
    };
    showSignupBtn.onclick = () => {
        signupDiv.classList.remove('hide');
        loginDiv.classList.add('hide');
        authMessageSpan.innerHTML = '';
    };


    signupBtn.onclick = () => {
        const email = signupEmail.value.trim();
        const password = signupPass.value.trim();

        if (!email || !password) {
            setAuthMessage("❌ Please fill both email and password", true);
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setAuthMessage("📧 Please enter a valid email address", true);
            return;
        }
        if (password.length < 4) {
            setAuthMessage("🔒 Password must be at least 4 characters", true);
            return;
        }

        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);
        setAuthMessage("✅ Account created! Now you can log in.", false);

        signupEmail.value = '';
        signupPass.value = '';
        setTimeout(() => {
            showLoginBtn.click();
        }, 800);
    };

    loginBtn.onclick = () => {
        const email = loginEmail.value.trim();
        const password = loginPass.value.trim();
        const storedEmail = localStorage.getItem("userEmail");
        const storedPass = localStorage.getItem("userPassword");

        if (!storedEmail || !storedPass) {
            setAuthMessage("⚠️ No account found. Please sign up first.", true);
            return;
        }

        if (email === storedEmail && password === storedPass) {
            setAuthMessage("🎉 Login successful! Welcome to AI Studio.", false);
            setTimeout(() => {
                authContainer.style.display = 'none';
                aiSection.style.display = 'flex';
                loginEmail.value = '';
                loginPass.value = '';
            }, 400);
        } else {
            setAuthMessage("❌ Wrong email or password. Try again.", true);
        }
    };

    async function generateAIImage() {
        const promptText = promptField.value.trim();
        if (!promptText) {
            imageBox.style.display = "block";
            imageBox.innerHTML = `<div style="padding:30px; text-align:center; color:#facc15;">Please enter prompt</div>`;
            setTimeout(() => {
                if (imageBox.innerHTML.includes("Please enter prompt")) {
                    imageBox.style.display = "none";
                }
            }, 2000);
            return;
        }

        const encodedPrompt = encodeURIComponent(promptText);
        const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Accept': 'image/*' }
            });
            if (!response.ok) throw new Error(`API status ${response.status}`);

            const blob = await response.blob();
            const imageObjectURL = URL.createObjectURL(blob);
            imageBox.innerHTML = `
                <div class="image-card">
                    <img src="${imageObjectURL}" alt="AI generated artwork">
                </div>
            `;
            const imgElement = imageBox.querySelector('img');
            if (imgElement) {
                imgElement.onload = () => URL.revokeObjectURL(imageObjectURL);
            }
        } catch (error) {
            console.error("Image generation error:", error);
            imageBox.innerHTML = `
                <div class="loader-container" style="background:#32000080;">
                    <div style="color:#ffb4a2; text-align:center; padding:15px;">⚠️ Failed to generate<br>check connection or try different prompt</div>
                    <button id="retryBtn" style="width:auto; padding:8px 20px; margin-top:8px; background:#0ea5e9;">⟳ Retry</button>
                </div>
            `;
            const retryButton = document.getElementById('retryBtn');
            if (retryButton) {
                retryButton.addEventListener('click', () => generateAIImage(), { once: true });
            }
        }
    }

    generateBtn.addEventListener('click', () => {
        if (imageBox.style.display === 'none' || imageBox.style.display === '') {
            imageBox.style.display = 'block';
        }
        generateAIImage();
    });

    promptField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateBtn.click();
        }
    });

    
    });
})();

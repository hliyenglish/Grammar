// ==========================================
// QUIZ DATA BANK
// ==========================================
const quizData = [
    {
        topic: "Prepositions",
        question: "I have an important meeting _____ Monday morning.",
        options: ["in", "on", "at", "by"],
        correctIndex: 1,
        explanation: "We use 'on' with days of the week and parts of specific days (on Monday morning)."
    },
    {
        topic: "Prepositions",
        question: "She has been living in Paris _____ 2015.",
        options: ["since", "for", "in", "from"],
        correctIndex: 0,
        explanation: "We use 'since' to refer to a specific point in time when an action started."
    },
    {
        topic: "Present Simple",
        question: "Water _____ at 100 degrees Celsius.",
        options: ["boil", "boils", "is boiling", "boiled"],
        correctIndex: 1,
        explanation: "We use Present Simple ('boils') for scientific facts and general truths."
    },
    {
        topic: "Present Simple",
        question: "My brother _____ to the gym every weekend.",
        options: ["go", "goes", "is going", "went"],
        correctIndex: 1,
        explanation: "We use 'goes' for third-person singular habits in Present Simple."
    },
    {
        topic: "Relative Clauses",
        question: "The man _____ car was stolen went to the police station.",
        options: ["who", "whom", "which", "whose"],
        correctIndex: 3,
        explanation: "'Whose' is used to show possession in relative clauses."
    },
    {
        topic: "Relative Clauses",
        question: "This is the restaurant _____ we had dinner last night.",
        options: ["which", "where", "that", "when"],
        correctIndex: 1,
        explanation: "'Where' is used as a relative pronoun for places."
    }
];

// ==========================================
// APP LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky header effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            header.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    });

    // 2. Load Dynamic Sidebar
    const sidebarContainer = document.getElementById('dynamic-sidebar');
    if (sidebarContainer) {
        loadDynamicSidebar();
    }

    // 3. Quiz Logic
    const questionText = document.getElementById('question-text');
    if (questionText) {
        initQuiz();
    }
});

// ==========================================
// GITHUB API SIDEBAR LOGIC (WITH SMART CACHE)
// ==========================================
async function loadDynamicSidebar(forceRefresh = false) {
    const sidebar = document.getElementById('dynamic-sidebar');
    
    // Nếu forceRefresh = true, sẽ hiển thị nút xoay báo đang tải
    if (forceRefresh) {
        sidebar.innerHTML = '<li style="text-align: center; color: var(--gray); padding: 1.5rem 0;"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Đang cập nhật...</li>';
    }

    try {
        let treeData = null;
        const CACHE_KEY = 'grammar_menu_cache';
        const CACHE_TIME_KEY = 'grammar_menu_time';
        const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

        // Kiểm tra cache nếu không bị ép buộc làm mới
        if (!forceRefresh) {
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
            
            if (cachedData && cachedTime) {
                const now = new Date().getTime();
                if (now - parseInt(cachedTime) < CACHE_DURATION) {
                    treeData = JSON.parse(cachedData);
                    console.log("Loaded menu from cache.");
                }
            }
        }

        // Nếu không có cache, hoặc bị ép buộc làm mới, hoặc cache hết hạn => Gọi API
        if (!treeData) {
            console.log("Fetching new menu from GitHub API...");
            const repoUrl = 'https://api.github.com/repos/hliyenglish/Grammar/git/trees/main?recursive=1';
            const response = await fetch(repoUrl);
            
            if (!response.ok) {
                // Nếu bị lỗi giới hạn API của GitHub (Rate Limit), thử dùng lại cache cũ nếu có
                const oldCache = localStorage.getItem(CACHE_KEY);
                if (oldCache) {
                    treeData = JSON.parse(oldCache);
                    console.warn("API Limit reached. Using old cache.");
                } else {
                    throw new Error(`GitHub API returned ${response.status}`);
                }
            } else {
                const data = await response.json();
                if (!data.tree) throw new Error("No tree found");
                treeData = data.tree;
                
                // Lưu vào cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(treeData));
                localStorage.setItem(CACHE_TIME_KEY, new Date().getTime().toString());
            }
        }

        // Xử lý dữ liệu
        const topics = {};
        
        treeData.forEach(item => {
            if (item.type === 'blob' && item.path.endsWith('.html') && item.path.includes('/')) {
                const parts = item.path.split('/');
                const folderName = parts[0];
                const fileName = parts[1];
                
                // Bỏ qua thư mục assets
                if (folderName === 'assets' || folderName === 'css' || folderName === 'js') return;
                
                if (!topics[folderName]) {
                    topics[folderName] = [];
                }
                
                let displayName = fileName.replace('.html', '');
                if(displayName.toLowerCase() === 'lesson') displayName = 'Main Lesson';
                if(displayName.toLowerCase() === 'homework') displayName = 'Homework';
                if(displayName.toLowerCase() === 'answer') displayName = 'Answers';
                if(displayName.toLowerCase() === 'app' || displayName.toLowerCase() === 'index') displayName = 'Open App';
                
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                
                topics[folderName].push({
                    path: item.path,
                    name: displayName
                });
            }
        });
        
        // Vẽ lại giao diện
        sidebar.innerHTML = '';
        
        const sortedFolders = Object.keys(topics).sort();
        
        if (sortedFolders.length === 0) {
            sidebar.innerHTML = '<li style="text-align: center; color: var(--gray); padding: 1rem;">No topics found on GitHub. Push some folders!</li>';
            return;
        }

        sortedFolders.forEach(folder => {
            const files = topics[folder];
            const prettyFolderName = folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            const li = document.createElement('li');
            li.className = 'dropdown-item';
            
            const header = document.createElement('div');
            header.className = 'topic-header';
            header.innerHTML = `
                <i class="fa-solid fa-folder topic-icon-sm"></i> 
                ${prettyFolderName} 
                <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
            `;
            
            const subLinks = document.createElement('ul');
            subLinks.className = 'sub-links';
            
            files.forEach(file => {
                const subLi = document.createElement('li');
                subLi.innerHTML = `<a href="${file.path}">${file.name}</a>`;
                subLinks.appendChild(subLi);
            });
            
            li.appendChild(header);
            li.appendChild(subLinks);
            sidebar.appendChild(li);
            
            header.addEventListener('click', () => {
                document.querySelectorAll('.sub-links').forEach(el => {
                    if (el !== subLinks) el.classList.remove('active');
                });
                document.querySelectorAll('.dropdown-arrow').forEach(el => {
                    if (el !== header.querySelector('.dropdown-arrow')) el.classList.remove('open');
                });

                subLinks.classList.toggle('active');
                header.querySelector('.dropdown-arrow').classList.toggle('open');
            });
        });
        
        // Thêm nút Cập nhật thủ công ở dưới cùng
        const refreshLi = document.createElement('li');
        refreshLi.style.marginTop = '2rem';
        refreshLi.style.textAlign = 'center';
        refreshLi.innerHTML = `<button onclick="loadDynamicSidebar(true)" style="background: none; border: 1px solid var(--gray); color: var(--gray); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;"><i class="fa-solid fa-rotate-right"></i> Làm mới danh sách</button>`;
        sidebar.appendChild(refreshLi);

    } catch (error) {
        console.error('Error loading sidebar:', error);
        sidebar.innerHTML = '<li style="color: var(--danger); padding: 1rem; text-align: center;">Could not load topics from GitHub. Check your internet or GitHub API limit.</li>';
    }
}

// ==========================================
// QUIZ SYSTEM LOGIC
// ==========================================
let currentQuestionIndex = 0;
let currentQuestionObj = null;

function initQuiz() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', loadRandomQuiz);
    }
    
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', handleOptionClick);
    });

    loadRandomQuiz();
}

function loadRandomQuiz() {
    const randomIndex = Math.floor(Math.random() * quizData.length);
    currentQuestionObj = quizData[randomIndex];
    
    document.getElementById('feedback-area').classList.add('hidden');
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });

    document.getElementById('quiz-topic').textContent = currentQuestionObj.topic;
    document.getElementById('question-text').textContent = currentQuestionObj.question;
    
    const optionSpans = document.querySelectorAll('.opt-text');
    currentQuestionObj.options.forEach((optText, index) => {
        if (optionSpans[index]) {
            optionSpans[index].textContent = optText;
        }
    });
}

function handleOptionClick(event) {
    const selectedBtn = event.currentTarget;
    const selectedIndex = parseInt(selectedBtn.getAttribute('data-index'));
    
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => btn.disabled = true);
    
    const feedbackArea = document.getElementById('feedback-area');
    const feedbackMsg = document.getElementById('feedback-msg');
    
    if (selectedIndex === currentQuestionObj.correctIndex) {
        selectedBtn.classList.add('correct');
        feedbackMsg.textContent = '🎉 Correct! ' + currentQuestionObj.explanation;
        feedbackMsg.className = 'feedback-msg success';
    } else {
        selectedBtn.classList.add('wrong');
        optionBtns[currentQuestionObj.correctIndex].classList.add('correct');
        feedbackMsg.textContent = '❌ Incorrect. ' + currentQuestionObj.explanation;
        feedbackMsg.className = 'feedback-msg error';
    }
    
    feedbackArea.classList.remove('hidden');
}

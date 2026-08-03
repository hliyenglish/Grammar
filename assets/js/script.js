// ==========================================
// QUIZ DATA BANK
// ==========================================
const quizData = [
    {
        topic: "Prepositions",
        question: "I have an important meeting _____ Monday morning.",
        options: ["in", "on", "at", "by"],
        correctIndex: 1, // "on"
        explanation: "We use 'on' with days of the week and parts of specific days (on Monday morning)."
    },
    {
        topic: "Prepositions",
        question: "She has been living in Paris _____ 2015.",
        options: ["since", "for", "in", "from"],
        correctIndex: 0, // "since"
        explanation: "We use 'since' to refer to a specific point in time when an action started."
    },
    {
        topic: "Present Simple",
        question: "Water _____ at 100 degrees Celsius.",
        options: ["boil", "boils", "is boiling", "boiled"],
        correctIndex: 1, // "boils"
        explanation: "We use Present Simple ('boils') for scientific facts and general truths."
    },
    {
        topic: "Present Simple",
        question: "My brother _____ to the gym every weekend.",
        options: ["go", "goes", "is going", "went"],
        correctIndex: 1, // "goes"
        explanation: "We use 'goes' for third-person singular habits in Present Simple."
    },
    {
        topic: "Relative Clauses",
        question: "The man _____ car was stolen went to the police station.",
        options: ["who", "whom", "which", "whose"],
        correctIndex: 3, // "whose"
        explanation: "'Whose' is used to show possession in relative clauses."
    },
    {
        topic: "Relative Clauses",
        question: "This is the restaurant _____ we had dinner last night.",
        options: ["which", "where", "that", "when"],
        correctIndex: 1, // "where"
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
// GITHUB API SIDEBAR LOGIC
// ==========================================
async function loadDynamicSidebar() {
    const sidebar = document.getElementById('dynamic-sidebar');
    
    try {
        // Sử dụng jsdelivr API để tránh lỗi giới hạn lượt truy cập của GitHub
        const repoUrl = 'https://data.jsdelivr.com/v1/package/gh/hliyenglish/Grammar@main';
        const response = await fetch(repoUrl);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        const topics = {};
        
        // Quét cấu trúc thư mục mới từ jsdelivr
        if (data.files) {
            data.files.forEach(folder => {
                // Chỉ lấy các thư mục (bỏ qua thư mục assets và các file lẻ ở ngoài)
                if (folder.type === 'directory' && folder.name !== 'assets') {
                    const folderName = folder.name;
                    topics[folderName] = [];
                    
                    folder.files.forEach(file => {
                        if (file.type === 'file' && file.name.endsWith('.html')) {
                            let displayName = file.name.replace('.html', '');
                            // Định dạng tên đẹp
                            if(displayName.toLowerCase() === 'lesson') displayName = 'Main Lesson';
                            if(displayName.toLowerCase() === 'homework') displayName = 'Homework';
                            if(displayName.toLowerCase() === 'answer') displayName = 'Answers';
                            
                            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                            
                            topics[folderName].push({
                                path: `${folderName}/${file.name}`,
                                name: displayName
                            });
                        }
                    });
                }
            });
        }
        
        // Render the Sidebar
        sidebar.innerHTML = '';
        
        const sortedFolders = Object.keys(topics).sort();
        
        if (sortedFolders.length === 0) {
            sidebar.innerHTML = '<li style="text-align: center; color: var(--gray); padding: 1rem;">No topics found. Push some folders!</li>';
            return;
        }

        sortedFolders.forEach(folder => {
            const files = topics[folder];
            
            // Format folder name: present-simple -> Present Simple
            const prettyFolderName = folder.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            const li = document.createElement('li');
            li.className = 'dropdown-item';
            
            // Create clickable header
            const header = document.createElement('div');
            header.className = 'topic-header';
            header.innerHTML = `
                <i class="fa-solid fa-folder topic-icon-sm"></i> 
                ${prettyFolderName} 
                <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
            `;
            
            // Create hidden sub-links list
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
            
            // Add Dropdown Toggle Event
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
        
    } catch (error) {
        console.error('Error loading sidebar:', error);
        sidebar.innerHTML = '<li style="color: var(--danger); padding: 1rem; text-align: center;">Hệ thống đang bảo trì hoặc mạng yếu. Vui lòng thử lại sau.</li>';
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

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const lecturesTab = document.getElementById('lecturesTab');
    const practicalsTab = document.getElementById('practicalsTab');
    const lecturesSection = document.getElementById('lecturesSection');
    const practicalsSection = document.getElementById('practicalsSection');

    lecturesTab.addEventListener('click', () => {
        lecturesTab.classList.add('active');
        practicalsTab.classList.remove('active');
        lecturesSection.classList.add('active');
        practicalsSection.classList.remove('active');
    });

    practicalsTab.addEventListener('click', () => {
        practicalsTab.classList.add('active');
        lecturesTab.classList.remove('active');
        practicalsSection.classList.add('active');
        lecturesSection.classList.remove('active');
    });

    // Add new items
    const addLectureBtn = document.getElementById('addLectureBtn');
    const addPracticalBtn = document.getElementById('addPracticalBtn');
    const newLectureInput = document.getElementById('newLecture');
    const newPracticalInput = document.getElementById('newPractical');
    const lecturesList = document.getElementById('lecturesList');
    const practicalsList = document.getElementById('practicalsList');

    function createListItem(text, completed = false) {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed;
        checkbox.style.marginRight = '8px';
        
        const span = document.createElement('span');
        span.textContent = text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.style.marginLeft = 'auto';
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        
        return li;
    }

    function addItem(input, list) {
        const text = input.value.trim();
        if (text) {
            const li = createListItem(text);
            list.appendChild(li);
            input.value = '';
            updateProgress();
            saveData();
        }
    }

    addLectureBtn.addEventListener('click', () => addItem(newLectureInput, lecturesList));
    addPracticalBtn.addEventListener('click', () => addItem(newPracticalInput, practicalsList));

    // Delete and toggle items
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.textContent === '×') {
            e.target.parentElement.remove();
            updateProgress();
            saveData();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            updateProgress();
            saveData();
        }
    });

    // Progress calculation
    function updateProgress() {
        const totalItems = document.querySelectorAll('.items-list li').length;
        const completedItems = document.querySelectorAll('.items-list li input[type="checkbox"]:checked').length;
        const progressValue = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
        document.getElementById('progressValue').textContent = `${progressValue}%`;
    }

    // Save and load data
    function saveData() {
        const data = {
            lectures: Array.from(lecturesList.children).map(li => ({
                text: li.querySelector('span').textContent,
                completed: li.querySelector('input[type="checkbox"]').checked
            })),
            practicals: Array.from(practicalsList.children).map(li => ({
                text: li.querySelector('span').textContent,
                completed: li.querySelector('input[type="checkbox"]').checked
            }))
        };
        chrome.storage.local.set({ flptData: data });
    }

    function loadData() {
        chrome.storage.local.get(['flptData'], (result) => {
            if (result.flptData) {
                result.flptData.lectures.forEach(item => {
                    lecturesList.appendChild(createListItem(item.text, item.completed));
                });
                result.flptData.practicals.forEach(item => {
                    practicalsList.appendChild(createListItem(item.text, item.completed));
                });
                updateProgress();
            }
        });
    }

    // Load saved data when popup opens
    loadData();
}); 
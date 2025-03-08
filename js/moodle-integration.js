function extractCourseInfo() {
    const courseData = {
        lectures: [],
        practicals: []
    };

    const sections = document.querySelectorAll('li.section.main, div.section.main');
    sections.forEach(section => {
        const sectionName = section.querySelector('.sectionname')?.textContent.trim() || '';
        const activities = section.querySelectorAll('.activity');

        activities.forEach(activity => {
            const activityLink = activity.querySelector('.activityinstance a');
            if (!activityLink) return;

            const activityName = activityLink.textContent.trim();
            const isCompleted = activity.querySelector('.completioncheckbox.completion-check') !== null;
            
            const isBBB = activity.classList.contains('modtype_bigbluebuttonbn');
            const isFile = activity.classList.contains('modtype_resource');
            
            const item = {
                text: `${sectionName} - ${activityName}`,
                completed: isCompleted,
                url: activityLink.href,
                type: isBBB ? 'lecture' : (isFile ? 'resource' : 'practical')
            };

            if (isBBB || activityName.toLowerCase().includes('предавање')) {
                courseData.lectures.push(item);
            } else if (activityName.toLowerCase().includes('вежби') || 
                      activityName.toLowerCase().includes('exercises')) {
                courseData.practicals.push(item);
            }
        });
    });

    return courseData;
}

function addProgressTracker() {
    const sections = document.querySelectorAll('li.section.main, div.section.main');
    
    sections.forEach(section => {
        const activities = section.querySelectorAll('.activity');
        
        activities.forEach(activity => {
            if (!activity.querySelector('.flpt-progress')) {
                const activityInstance = activity.querySelector('.activityinstance');
                if (!activityInstance) return;

                const progressDiv = document.createElement('div');
                progressDiv.className = 'flpt-progress';
                
                const trackBtn = document.createElement('button');
                trackBtn.className = 'flpt-track-btn';
                trackBtn.textContent = 'Track Progress';
                trackBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    activity.classList.toggle('flpt-tracked');
                    updateStorage();
                };
                
                progressDiv.appendChild(trackBtn);
                activityInstance.appendChild(progressDiv);
            }
        });
    });
}

function updateStorage() {
    const courseData = extractCourseInfo();
    const courseId = window.location.pathname.split('/').find(part => part.includes('_'));
    
    chrome.storage.local.get(['flptData'], (result) => {
        const data = result.flptData || {};
        data[courseId] = courseData;
        chrome.storage.local.set({ flptData: data });
    });
}

function init() {
    if (window.location.hostname === 'courses.finki.ukim.mk' && 
        document.querySelector('.course-content')) {
        addProgressTracker();
        updateStorage();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            init();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
}); 
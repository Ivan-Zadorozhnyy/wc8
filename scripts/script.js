class TodoItem {
    constructor(text, timestamp, isCompleted = false) {
        this.text = text;
        this.timestamp = timestamp;
        this.isCompleted = isCompleted;
    }

    toggleCompleted() {
        this.isCompleted = !this.isCompleted;
    }
}

class TodoItemPremium extends TodoItem {
    constructor(text, timestamp, isCompleted, image) {
        super(text, timestamp, isCompleted);
        this.image = image; // URL or data URI of the image/icon
    }
}

class TaskList {
    constructor(tasks = [], sortDirection = 'desc') {
        this.tasks = tasks;
        this.sortDirection = sortDirection;
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index !== -1) {
            this.tasks.splice(index, 1);
        }
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.isCompleted);
    }

    sortTasks() {
        if (this.sortDirection === 'asc') {
            this.tasks.sort((a, b) => a.timestamp - b.timestamp);
        } else {
            this.tasks.sort((a, b) => b.timestamp - a.timestamp);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        localStorage.setItem('sortDirection', this.sortDirection);
    }

    loadFromLocalStorage() {
        this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        this.sortDirection = localStorage.getItem('sortDirection') || 'desc';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const taskListInstance = new TaskList();
    taskListInstance.loadFromLocalStorage();
    updateTaskList();

    document.getElementById('sortAsc').addEventListener('click', () => {
        taskListInstance.sortDirection = 'asc';
        taskListInstance.sortTasks();
        taskListInstance.saveToLocalStorage();
        updateTaskList();
    });

    document.getElementById('sortDesc').addEventListener('click', () => {
        taskListInstance.sortDirection = 'desc';
        taskListInstance.sortTasks();
        taskListInstance.saveToLocalStorage();
        updateTaskList();
    });

    document.getElementById('clearStorage').addEventListener('click', () => {
        localStorage.clear();
        taskListInstance.tasks = [];
        updateTaskList();
    });

    document.getElementById('saveTask').addEventListener('click', addOrUpdateTask);
    document.getElementById('taskInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addOrUpdateTask();
        if (e.key === 'Escape') {
            document.getElementById('taskInput').value = '';
            editingTask = null;
        }
    });

    document.getElementById('pickRandom').addEventListener('click', highlightRandomTask);

    function addOrUpdateTask() {
        const taskText = document.getElementById('taskInput').value.trim();
        const imageUrl = document.getElementById('imageInput').value.trim();

        if (!taskText) return;

        const timestamp = new Date().getTime();
        let task;

        if (imageUrl) {
            task = new TodoItemPremium(taskText, timestamp, false, imageUrl);
        } else {
            task = new TodoItem(taskText, timestamp, false);
        }

        taskListInstance.addTask(task);
        document.getElementById('taskInput').value = '';
        document.getElementById('imageInput').value = '';
        taskListInstance.saveToLocalStorage();
        updateTaskList();
    }

    function updateTaskList() {
        const taskListElement = document.getElementById('taskList');
        taskListElement.innerHTML = '';

        taskListInstance.tasks.forEach(task => {
            const li = document.createElement('li');

            // Checkbox for task completion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.isCompleted;
            checkbox.addEventListener('change', () => {
                task.toggleCompleted();
                taskListInstance.saveToLocalStorage();
                updateTaskList();
            });
            li.appendChild(checkbox);

            // Task text and timestamp
            const span = document.createElement('span');
            span.textContent = `${task.text} (${new Date(task.timestamp).toLocaleString()})`;
            li.appendChild(span);

            // Display image if the task is a TodoItemPremium
            if (task instanceof TodoItemPremium && task.image) {
                const img = document.createElement('img');
                img.src = task.image;
                img.alt = "Task Image";
                img.width = 50; // or any desired size
                img.style.marginLeft = '10px'; // Add some margin for better visual separation
                li.appendChild(img);
            }

            // Remove button for the task
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                taskListInstance.removeTask(task);
                taskListInstance.saveToLocalStorage();
                updateTaskList();
            });
            li.appendChild(removeBtn);

            taskListElement.appendChild(li);
        });
    }

    function highlightRandomTask() {
        const taskListElement = document.getElementById('taskList');
        const tasks = taskListInstance.tasks;
        console.log("Total tasks:", tasks.length);

        if (tasks.length === 0) return;

        const randomIndex = Math.floor(Math.random() * tasks.length);
        console.log("Randomly selected index:", randomIndex);

        // Remove any existing highlights
        const taskElements = taskListElement.querySelectorAll('li');
        taskElements.forEach(el => el.classList.remove('highlighted'));

        // Highlight the randomly selected task
        taskElements[randomIndex].classList.add('highlighted');
    }
})

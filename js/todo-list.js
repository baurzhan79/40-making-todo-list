"use strict";

$(() => {
    let taskName = "";
    let taskIdToDo = 0;
    let taskIdInProgress = 0;
    let taskIdDone = 0;
    let storageKey = "";
    let storageValue = "";
    let tasksToDo = {};
    let tasksInProgress = {};
    let tasksDone = {};

    const storeTask = (parentId, tasksObj) => {
        storageKey = parentId;

        const countElementsObj = Object.keys(tasksObj).length;
        if (countElementsObj > 0) {
            storageValue = JSON.stringify(tasksObj);
            localStorage.setItem(storageKey, storageValue);
        }
        else localStorage.removeItem(storageKey);
    }

    const deleteTaskFromObject = (parentId, taskId) => {
        if (parentId === "to-do") {
            delete tasksToDo[taskId]; // удаляем элемент из объекта
            storeTask(parentId, tasksToDo); // перезаписываем хранилище с обновленными данными
        }
        else if (parentId === "in-progress") {
            delete tasksInProgress[taskId]; // удаляем элемент из объекта
            storeTask(parentId, tasksInProgress); // перезаписываем хранилище с обновленными данными
        }
        else if (parentId === "done") {
            delete tasksDone[taskId]; // удаляем элемент из объекта
            storeTask(parentId, tasksDone); // перезаписываем хранилище с обновленными данными
        }
    }

    const getLastTaskId = (tasksObj) => {
        let taskId = 0;
        const arrayOfTaskId = Object.keys(tasksObj);
        for (let id of arrayOfTaskId) {
            if (id > taskId) taskId = id;
        }
        return taskId;
    }

    // создание нового объекта задачи
    const makeElement = (taskId, taskName, parentId, buttonName) => {
        // формируем содержимое элемента
        const contents = `<div class="card-head">
                            <p class="card-text">${taskName}</p>
                            <button class="btn card-head-btn">X</button>
                        </div>
                        <div class="card-body">
                            <button class="btn card-body-btn">${buttonName}</button>
                        </div>`;

        // создаем родительский элемент
        const container = $(`#div-${parentId} .cards`);
        const el = $("<div>");
        el.attr("class", "card");
        el.attr("id", `card-${parentId}-${taskId}`);
        el.html(contents);
        container.append(el);

        // привязываем удаление по крестику
        $(`#card-${parentId}-${taskId} .card-head-btn`).on("click", () => {
            // спросить у пользователя подтверждения
            const answer = confirm("Do you really want to delete it?");
            if (answer !== undefined && answer) {
                // удаляем элемент из текущего процесса
                deleteTaskFromObject(parentId, taskId);
                el.remove();
                if (parentId === "to-do") taskIdToDo = getLastTaskId(tasksToDo); // обновляем значение последнего id
                else if (parentId === "in-progress") taskIdInProgress = getLastTaskId(tasksInProgress); // обновляем значение последнего id
                else if (parentId === "done") taskIdDone = getLastTaskId(tasksDone); // обновляем значение последнего id
            };
        })

        // перемещение задачи из одного процесса в другой по кнопке
        $(`#card-${parentId}-${taskId} .card-body-btn`).on("click", () => {
            if (parentId === "to-do") {
                // перемещаем элемент задачи из процесса "To Do" в процесс "In Progress"
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to move this task?");
                if (answer !== undefined && answer) {
                    // удаляем текущий элемент из текущего процесса
                    deleteTaskFromObject(parentId, taskId);
                    el.remove();
                    taskIdToDo = getLastTaskId(tasksToDo); // обновляем значение последнего id

                    // создаем копию текущего элемента задачи и добавляем в другой процесс
                    taskIdInProgress++;
                    addTask(taskIdInProgress, taskName, "in-progress");
                };
            }
            else if (parentId === "in-progress") {
                // перемещаем элемент задачи из процесса "In Progress" в процесс "Done"
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to move this task?");
                if (answer !== undefined && answer) {
                    // удаляем текущий элемент из текущего процесса
                    deleteTaskFromObject(parentId, taskId);
                    el.remove();
                    taskIdInProgress = getLastTaskId(tasksInProgress); // обновляем значение последнего id

                    // создаем копию текущего элемента задачи и добавляем в другой процесс
                    taskIdDone++;
                    addTask(taskIdDone, taskName, "done");
                };
            }
            else if (parentId === "done") {
                // удаляем текущий элемент из текущего процесса
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to delete it?");
                if (answer !== undefined && answer) {
                    // удаляем текущий элемент из текущего процесса
                    deleteTaskFromObject(parentId, taskId);
                    el.remove();
                    taskIdDone = getLastTaskId(tasksDone); // обновляем значение последнего id
                };
            }
        });
    };

    // Добавление задачи
    const addTask = (taskId, taskName, parentId) => {
        if (parentId === "to-do") {
            // создаем элемент по наименованию задачи
            makeElement(taskId, taskName, parentId, "In Progress >");

            // добавляем задачу в свой объект
            tasksToDo[taskId] = taskName;

            // записывает новый элемент задачи в хранилище по ключу "to-do" c номером id задачи
            storeTask(parentId, tasksToDo);
        }
        else if (parentId === "in-progress") {
            // создаем элемент по наименованию задачи
            makeElement(taskId, taskName, parentId, "Done >");

            // добавляем задачу в свой объект
            tasksInProgress[taskId] = taskName;

            // записывает новый элемент задачи в хранилище по ключу "in-progress" c номером id задачи
            storeTask(parentId, tasksInProgress);
        }
        else {
            // создаем элемент по наименованию задачи
            makeElement(taskId, taskName, parentId, "Delete");

            // добавляем задачу в свой объект
            tasksDone[taskId] = taskName;

            // записывает новый элемент задачи в хранилище по ключу "done" c номером id задачи
            storeTask(parentId, tasksDone);
        }
    }

    const getTasksFromStorage = (storageKey, storageValue) => {
        if (storageKey === "to-do") {
            tasksToDo = JSON.parse(storageValue);
            const arrayOfTaskId = Object.keys(tasksToDo);
            for (let id of arrayOfTaskId) {
                taskName = tasksToDo[id];
                taskIdToDo = id;
                addTask(taskIdToDo, taskName, storageKey);
            }
            taskIdToDo = getLastTaskId(tasksToDo); // обновляем значение последнего id
        }
        else if (storageKey === "in-progress") {
            tasksInProgress = JSON.parse(storageValue);
            const arrayOfTaskId = Object.keys(tasksInProgress);
            for (let id of arrayOfTaskId) {
                taskName = tasksInProgress[id];
                taskIdInProgress = id;
                addTask(taskIdInProgress, taskName, storageKey);
            }
            taskIdInProgress = getLastTaskId(tasksInProgress); // обновляем значение последнего id
        }
        else if (storageKey === "done") {
            tasksDone = JSON.parse(storageValue);
            const arrayOfTaskId = Object.keys(tasksDone);
            for (let id of arrayOfTaskId) {
                taskName = tasksDone[id];
                taskIdDone = id;
                addTask(taskIdDone, taskName, storageKey);
            }
            taskIdDone = getLastTaskId(tasksDone); // обновляем значение последнего id
        }
    }

    const init = () => {
        for (let index = 0; index < localStorage.length; index++) {
            storageKey = localStorage.key(index); // берем имя ключа по индексу
            storageValue = localStorage.getItem(storageKey); // берем значение ключа по индексу
            getTasksFromStorage(storageKey, storageValue);
        }
    };

    init();

    $("#btn-add").on("click", () => {
        taskName = $("#new-task").val();
        if (taskName === "") alert("You didn't enter task name!");
        else {
            taskIdToDo++;
            addTask(taskIdToDo, taskName, "to-do");
            taskName = "";
            $("#new-task").val(taskName);
        }
    })
});

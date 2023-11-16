"use strict";

let taskName = "";
let taskId = 0;
let storageKey = "";
let initial = true;

window.addEventListener('DOMContentLoaded', function () {
    // создание нового объекта задачи
    const makeElement = (newTaskName, newButtonName) => {
        // формируем содержимое элемента
        const contents = `<div class="d-flex justify-content-between">
                            <p class="font-weight-bold" id="task-name">${newTaskName}</p>
                            <span class="font-weight-bold task-close">x</span>
                        </div>
                        <div>
                            <button class="btn-move">${newButtonName}</button>
                        </div>`;

        // создаем родительский элемент
        const el = document.createElement("div");
        el.classList.add("card-body", "border", "border-dark", "mx-2", "my-2", "bg-secondary");
        el.innerHTML = contents;

        taskId++;
        el.setAttribute("id", taskId);

        // привязываем удаление по крестику
        el.querySelector(".task-close").addEventListener('click', function () {
            // спросить у пользователя подтверждения
            const answer = confirm("Do you really want to delete it?");
            if (answer !== undefined && answer) {
                // удаляем элемент задачи из хранилища по ключу c номером id задачи
                const parentId = this.parentElement.parentElement.parentElement.id;
                storageKey = `${parentId}-${el.getAttribute("id")}`;
                console.log(storageKey);
                localStorage.removeItem(storageKey);

                // удаляем элемент из текущего процесса
                el.remove();
            };
        });

        // перемещение задачи из одного процесса в другой по кнопке
        el.querySelector(".btn-move").addEventListener('click', function () {
            // определяем родителя к которому относится процесс
            const parentId = this.parentElement.parentElement.parentElement.id;

            if (parentId === "to-do") {
                // перемещаем элемент задачи из процесса "To Do" в процесс "In Progress"
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to move this task?");
                if (answer !== undefined && answer) {
                    // получаем наименование задачи из родителя
                    taskName = el.querySelector("#task-name").innerHTML;

                    // создаем копию текущего элемента задачи и добавляем в другой процесс
                    addTask(taskName, "in-progress");

                    // удаляем старый элемент задачи из хранилища по ключу "to-do" c номером id задачи
                    storageKey = `to-do-${el.getAttribute("id")}`;
                    localStorage.removeItem(storageKey);

                    // удаляем текущий элемент из текущего процесса
                    el.remove();
                };
            }
            else if (parentId === "in-progress") {
                // перемещаем элемент задачи из процесса "In Progress" в процесс "Done"
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to move this task?");
                if (answer !== undefined && answer) {
                    // получаем наименование задачи из родителя
                    taskName = el.querySelector("#task-name").innerHTML;

                    // создаем копию текущего элемента задачи и добавляем в другой процесс
                    addTask(taskName, "done");

                    // удаляем старый элемент задачи из хранилища по ключу "in-progress" c номером id задачи
                    storageKey = `in-progress-${el.getAttribute("id")}`;
                    localStorage.removeItem(storageKey);

                    // удаляем текущий элемент из текущего процесса
                    el.remove();
                };
            }
            else {
                // родителем является последний процесс,
                // соответственно дальнейшее нажатие кнопки просто удаляет текущий элемент

                // удаляем текущий элемент из текущего процесса
                // предварительно спросив у пользователя подтверждения
                const answer = confirm("Do you really want to delete it?");
                if (answer !== undefined && answer) {
                    // удаляем элемент задачи из хранилища по ключу "done" c номером id задачи
                    storageKey = `done-${el.getAttribute("id")}`;
                    localStorage.removeItem(storageKey);

                    // удаляем сам элемент
                    el.remove();
                };
            }
        });

        return el;
    };

    const storeTask = (el, parentId, taskName) => {
        storageKey = `${parentId}-${el.getAttribute("id")}`;
        localStorage.setItem(storageKey, taskName);
    }

    // Добавление задачи
    const addTask = (taskName, parentId) => {
        if (parentId === "to-do") {
            // создаем элемент по наименованию задачи
            const el = makeElement(taskName, "In Progress >");
            document.getElementById(parentId).append(el);
            if (!initial) {
                // записывает новый элемент задачи в хранилище по ключу "to-do" c номером id задачи
                storeTask(el, parentId, taskName);
            }
        }
        else if (parentId === "in-progress") {
            // создаем элемент по наименованию задачи
            const el = makeElement(taskName, "Done >");
            document.getElementById(parentId).append(el);
            if (!initial) {
                // записывает новый элемент задачи в хранилище по ключу "in-progress" c номером id задачи
                storeTask(el, parentId, taskName);
            }
        }
        else {
            // создаем элемент по наименованию задачи
            const el = makeElement(taskName, "Delete");
            document.getElementById(parentId).append(el);
            if (!initial) {
                // записывает новый элемент задачи в хранилище по ключу "done" c номером id задачи
                storeTask(el, parentId, taskName);
            }
        }
    }

    const init = () => {
        for (let index = 0; index < localStorage.length; index++) {
            storageKey = localStorage.key(index); // берем имя ключа по индексу
            taskName = localStorage.getItem(storageKey); // берем значение ключа по индексу
            console.log(`${storageKey} - ${taskName}`);

            const indexToDo = storageKey.indexOf("to-do-");
            if (indexToDo !== undefined && indexToDo >= 0) {
                addTask(taskName, "to-do");
            };

            const indexInProgress = storageKey.indexOf("in-progress-");
            if (indexInProgress !== undefined && indexInProgress >= 0) {
                addTask(taskName, "in-progress");
            };

            const indexDone = storageKey.indexOf("done-");
            if (indexDone !== undefined && indexDone >= 0) {
                addTask(taskName, "done");
            };
        }
        initial = false;
    };

    // привываю к кнопке на событие щелчок действие
    document.getElementById('button-add').addEventListener('click', () => {
        // берем наименование задачи из элемента страницы
        taskName = document.getElementById('field-toDo').value;
        addTask(taskName, "to-do");
    });

    init();
})
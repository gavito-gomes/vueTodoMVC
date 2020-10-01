/*global Vue, todoStorage, list */

(function (exports) {
    "use strict";

    var filters = {
        all: function (list) {
            return list;
        },
        active: function (list) {
            return list.filter(function (todo) {
                return !todo.completed;
            });
        },
        completed: function (list) {
            return list.filter(function (todo) {
                return todo.completed;
            });
        },
    };

    exports.app = new Vue({
        // the root element that will be compiled
        el: ".todoapp",

        // app initial state
        data: {
            lists: todoStorage.fetch(),
            newTodo: null,
            newTodoListId: null,
            editedTodo: null,
            newList: null,
            editedList: null,
            activeFilters: [],
            colors: [
                "#EE7F7F",
                "#AEAEAE",
                "#F2CC73",
                "#AC96D2",
                "#7EB4D4",
                "#7ED48A",
                "#EEAB7F",
            ],
        },

        // watch todos change for localStorage persistence
        watch: {
            lists: {
                deep: true,
                handler: todoStorage.save,
            },
        },

        // created is called right after the instance is created
        created: function () {
            for (let i = 0; i < this.lists.length; i++) {
                this.activeFilters.push("all");
            }
        },

        // methods that implement data logic.
        // note there's no DOM manipulation here at all.
        methods: {
            addTodo: function (id) {
                this.newTodo = "";
                this.newTodoListId = id;
            },

            doneAddTodo: function () {
                var value = this.newTodo && this.newTodo.trim();
                if (!value) {
                    return;
                }
                this.lists[this.newTodoListId].todos.push({
                    id: this.lists[this.newTodoListId].length,
                    title: value,
                    completed: false,
                });
                this.newTodo = null;
                this.newTodoListId = null;
            },

            cancelAddTodo: function () {
                this.newTodo = null;
                this.newTodoListId = null;
            },

            removeTodo: function (listId, todo) {
                var index = this.lists[listId].todos.indexOf(todo);
                this.lists[listId].todos.splice(index, 1);
            },

            editTodo: function (todo) {
                this.beforeEditCache = todo.title;
                this.editedTodo = todo;
            },

            doneEditTodo: function (todo) {
                if (!this.editedTodo) {
                    return;
                }
                this.editedTodo = null;
                todo.title = todo.title.trim();
                if (!todo.title) {
                    this.removeTodo(todo);
                }
            },

            cancelEditTodo: function (todo) {
                this.editedTodo = null;
                todo.title = this.beforeEditCache;
            },

            removeCompleted: function (listId) {
                this.lists[listId].todos = filters.active(
                    this.lists[listId].todos
                );
            },

            addList: function () {
                this.newList = {
                    title: "",
                    color: this.colors[0],
                };
            },

            doneAddList: function () {
                var value = this.newList.title && this.newList.title.trim();

                var alreadyExists =
                    this.lists.filter(function (list) {
                        return list.title == value;
                    }).length > 0;

                if (!value || alreadyExists) {
                    this.newList = null;
                    return;
                }
                this.lists.push({
                    id: this.lists.length,
                    title: value,
                    color: this.newList.color,
                    todos: [],
                });
                this.newList = null;
                this.activeFilters.push("all");
            },

            cancelAddList: function () {
                this.newList = null;
            },

            editList: function (index) {
                this.editedList = {
                    id: index,
                    title: this.lists[index].title,
                    color: this.lists[index].color,
                    todos: this.lists[index].todos,
                };
            },

            doneEditList: function () {
                var value =
                    this.editedList.title && this.editedList.title.trim();

                if (!value) {
					this.removeList(this.editedList.id);
					this.editedList = null;
					return;
                }
                this.lists[this.editedList.id] = this.editedList;
                this.editedList = null;
            },

            cancelEditList: function () {
                this.editedList = null;
            },

            removeList: function (index) {
                this.lists.splice(index, 1);
            },

            filterList: function (listId, filter) {
                return filter && filters[filter](this.lists[listId].todos);
            },

            completeAll: function (listId) {
                var value =
                    filters.completed(this.lists[listId].todos).length == 0;
                console.log(value);
                this.lists[listId].todos.map(function (todo) {
                    todo.completed = value;
                });
            },

            selectActiveFilter: function (listId, filter) {
                this.activeFilters[listId] = filter;
                this.$forceUpdate();
            },
        },

        // a custom directive to wait for the DOM to be updated
        // before focusing on the input field.
        // http://vuejs.org/guide/custom-directive.html
        directives: {
            "todo-focus": function (el, binding) {
                if (binding.value) {
                    el.focus();
                }
            },
        },

        // filters for text formatting
        // https://vuejs.org/v2/guide/filters.html

        filters: {
            capitalize: function (value) {
                if (!value) return "";
                value = value.toString();
                return value.charAt(0).toUpperCase() + value.slice(1);
            },

            pluralize: function (value, count) {
                return value + (count == 1 ? "" : "s");
            },
        },
    });
})(window);

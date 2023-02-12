import Vue from 'vue'
import { uid, Notify } from 'quasar'
import { firebaseDb, firebaseAuth } from 'boot/firebase'
import { showErrorMessage } from 'src/functions/function-show-error-message'

const state = {
	tasks: {
		// 'ID1': {
		// 	name: 'Get Pineapples',
		// 	completed: false,
		// 	dueDate: '2022/02/28',
		// 	dueTime: '12:40',
    //   deleted: false
		// },
		// 'ID2': {
		// 	name: 'Get Bananas',
		// 	completed: false,
		// 	dueDate: '2022/02/28',
		// 	dueTime: '18:51',
    //   deleted: false
		// },
		// 'ID3': {
		// 	name: 'Get Apples',
		// 	completed: false,
		// 	dueDate: '2022/02/26',
		// 	dueTime: '2:50',
    //   deleted: false
		// },
    // 'ID4': {
		// 	name: 'Get Strawberries',
		// 	completed: false,
		// 	dueDate: '2022/02/26',
		// 	dueTime: '3:43',
    //   deleted: false
		// }
	},
	search: '',
	sort: 'name',
	tasksDownloaded: false
}

const mutations = {
	updateTask(state, payload) {
		Object.assign(state.tasks[payload.id], payload.updates)
	},
	deleteTask(state, id) {
		Vue.delete(state.tasks, id)
	},
	addTask(state, payload) {
		Vue.set(state.tasks, payload.id, payload.task)
	},
	clearTasks(state) {
		state.tasks = {}
	},
	setSearch(state, value) {
		state.search = value
	},
	setSort(state, value) {
		state.sort = value
	},
	setTasksDownloaded(state, value) {
		state.tasksDownloaded = value
	}
}

const actions = {
	updateTask({ dispatch }, payload) {
		dispatch('fbUpdateTask', payload)
	},
	deleteTask({ dispatch }, id) {
		dispatch('fbDeleteTask', id)
	},
	addTask({ dispatch }, task) {
		let taskId = uid()
		let payload = {
			id: taskId,
			task: task
		}
		dispatch('fbAddTask', payload)
	},
	setSearch({ commit }, value) {
		commit('setSearch', value)
	},
	setSort({ commit }, value) {
		commit('setSort', value)
	},

	fbReadData({ commit }) {
		let userId = firebaseAuth.currentUser.uid
		let userTasks = firebaseDb.ref('tasks/' + userId)

		userTasks.once('value', snapshop => {
			commit('setTasksDownloaded', true)
		}, error => {
			showErrorMessage(error.message)
			this.$router.replace('/auth')
		})

		userTasks.on('child_added', snapshot => {
			let task = snapshot.val()
			let payload = {
				id: snapshot.key,
				task: task
			}
			commit('addTask', payload)
		})

		userTasks.on('child_changed', snapshot => {
			let task = snapshot.val()
			let payload = {
				id: snapshot.key,
				updates: task
			}
			commit('updateTask', payload)
		})

		userTasks.on('child_removed', snapshot => {
			let taskId = snapshot.key
			commit('deleteTask', taskId)
		})
	},
	fbAddTask({}, payload) {
		let userId = firebaseAuth.currentUser.uid
		let taskRef = firebaseDb.ref('tasks/' + userId + '/' + payload.id)
		taskRef.set(payload.task, error => {
			if (error) {
				showErrorMessage(error.message)
			}
			else {
				Notify.create('Task added!')
			}
		})
	},
	fbUpdateTask({}, payload) {
		let userId = firebaseAuth.currentUser.uid
		let taskRef = firebaseDb.ref('tasks/' + userId + '/' + payload.id)
		taskRef.update(payload.updates, error => {
			if (error) {
				showErrorMessage(error.message)
			}
			else {
				let keys = Object.keys(payload.updates)
				if (!(keys.includes('completed') && keys.length == 1)) {
					Notify.create('Task updated!')
				}
			}
		})
	},
	fbDeleteTask({}, taskId) {
		let userId = firebaseAuth.currentUser.uid
		let taskRef = firebaseDb.ref('tasks/' + userId + '/' + taskId)
		taskRef.remove(error => {
			if (error) {
				showErrorMessage(error.message)
			}
			else {
				Notify.create('Task deleted!')
			}
		})
	}
}

const getters = {
	tasksSorted: (state) => {
		let tasksSorted = {},
				keysOrdered = Object.keys(state.tasks)

		keysOrdered.sort((a,b) => {
			let taskAProp = state.tasks[a][state.sort].toLowerCase(),
					taskBProp = state.tasks[b][state.sort].toLowerCase()

			if (taskAProp > taskBProp) return 1
			else if (taskAProp < taskBProp) return -1
			else return 0
		})

		keysOrdered.forEach((key) => {
			tasksSorted[key] = state.tasks[key]
		})

		return tasksSorted
	},
	tasksFiltered: (state, getters) => {
		let tasksSorted = getters.tasksSorted,
				tasksFiltered = {}
		if (state.search) {
			Object.keys(tasksSorted).forEach(function(key) {
				let task = tasksSorted[key],
						taskNameLowerCase = task.name.toLowerCase(),
						searchLowerCase = state.search.toLowerCase()
				if (taskNameLowerCase.includes(searchLowerCase)) {
					tasksFiltered[key] = task
				}
			})
			return tasksFiltered
		}
		return tasksSorted
	},
	tasksTodo: (state, getters) => {
		let tasksFiltered = getters.tasksFiltered
		let tasks = {}
		Object.keys(tasksFiltered).forEach(function(key) {
			let task = tasksFiltered[key]
			if (!task.completed) {
				tasks[key] = task
			}
		})
		return tasks
	},
	tasksCompleted: (state, getters) => {
		let tasksFiltered = getters.tasksFiltered
		let tasks = {}
		Object.keys(tasksFiltered).forEach(function(key) {
			let task = tasksFiltered[key]
			if (task.completed) {
				tasks[key] = task
			}
		})
		return tasks
	},
  tasksDeleted: (state, getters) => {
		let tasksFiltered = getters.tasksFiltered
		let tasks = {}
		Object.keys(tasksFiltered).forEach(function(key) {
			let task = tasksFiltered[key]
			if (task.deleted) {
				tasks[key] = task
			}
		})
		return tasks
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
}

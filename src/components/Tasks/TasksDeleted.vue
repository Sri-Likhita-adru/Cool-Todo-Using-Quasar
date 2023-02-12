<template>
	<div class="q-mt-lg">
		<list-header
			bgColor="bg-red-4">Deleted</list-header>
		<q-list
			separator
			bordered>

			<task
				v-for="(task, key) in tasksDeleted"
		  	:key="key"
		  	:task="task"
		  	:id="key"></task>
		</q-list>
	</div>
</template>

<script>
	export default {
		props: ['tasksDeleted'],
		components: {
      'task' : require('components/Tasks/Task.vue').default,
			'list-header' : require('components/Shared/ListHeader.vue').default,
		}
	}
</script>


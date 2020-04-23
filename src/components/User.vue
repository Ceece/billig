<template>
  <div v-if="user.username" class="text-center">

    <div class="profile">

			<div class="profile-image">

				<img :src="user.image" alt="">

			</div>

			<div class="profile-user-settings">

				<h1 class="profile-user-name">{{ user.username }}</h1>

			</div>

			<div class="profile-stats">

				<ul>
					<li><span class="profile-stat-count">{{ user.posts }}</span> posts</li>
					<li><span class="profile-stat-count">{{ user.followers }}</span> followers</li>
					<li><span class="profile-stat-count">{{ user.following }}</span> following</li>
				</ul>

			</div>

			<div class="profile-bio">

				<p>{{ user.biography}}</p>
        <p><a :href="user.external_url">{{ user.external_url }}</a></p>

			</div>

		</div>
  </div>
</template>

<script>
export default {
  name: 'User',
	props: ['user']
}
</script>
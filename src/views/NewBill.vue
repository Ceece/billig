<template>
  <div>
    <form class="form-inline" v-on:submit="e => fetchUser(e)">
      <label class="sr-only" for="username">IG Username</label>
      <input type="text" class="form-control mb-2 mr-sm-2" id="username" placeholder="IG Username" v-model="usernameInput">
      <button type="submit" class="btn btn-primary mb-2">Submit</button>
    </form>

    <User v-bind:user="user" />

		<div class="gallery">

			<div class="gallery-item" v-for="(item) in media" v-bind:key="item.id">

        <label :for="item.id" class="gallery-label">
          <img :src="item.image" class="gallery-image" alt="">
        </label>

        <input class="d-none" type="checkbox" :id="item.id" :value="item" v-model="checkedMedia">

				<label :for="item.id" class="gallery-item-info">
          <span class="truncate">{{item.caption}}</span>
				</label>

			</div>

		</div>

    <div class="container footer">
      <span class="text-muted">Cart should be here.</span>
    </div>
	</div>
</template>

<script>
import axios from 'axios'
import User from '@/components/User.vue'

export default {
  name: 'NewBill',
  components: {
    User
  },
  data: function () {
    return {
      usernameInput: '',
      user: {},
      media: [],
      checkedMedia: []
    }
  },
  mounted() {
    if (localStorage.user) {
      this.user = JSON.parse(localStorage.user)
      this.usernameInput = this.user.username
    }
    if (localStorage.media) {
      this.media = JSON.parse(localStorage.media)
    }
  },
  watch: {
    user(newUser) {
      localStorage.user = JSON.stringify(newUser)
    },
    media(newMedia) {
      localStorage.media = JSON.stringify(newMedia)
    }
  },
  methods: {
    fetchUser: function (e) {
      e && e.preventDefault()
      axios.get(`https://www.instagram.com/${this.usernameInput}/?__a=1`)
      .then(({ data }) => {
        const user = data.graphql.user
        this.user = {
          id: user.id,
          username: user.username,
          image: user.profile_pic_url_hd,
          posts: user.edge_owner_to_timeline_media.count,
          followers: user.edge_followed_by.count,
          following: user.edge_follow.count,
          biography: user.biography,
          external_url: user.external_url,
        }
        this.fetchMedia()
      })
    },
    fetchMedia: function (e) {
      e && e.preventDefault()
      axios.get(`https://www.instagram.com/graphql/query/?first=50&query_id=17888483320059182&id=${this.user.id}`)
      .then(({ data }) => {
        this.media = data.data.user.edge_owner_to_timeline_media.edges.map(media => {
          const node = media.node
          return {
            id: node.shortcode,
            caption: node.edge_media_to_caption.edges[0].node.text,
            image: node.thumbnail_src
          }
        })
      })
    }
  }
}
</script>

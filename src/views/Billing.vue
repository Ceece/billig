<template>
  <div>
    <form class="form-inline" v-on:submit="e => fetchUser(e)">
      <label class="sr-only" for="username">IG Username</label>
      <input type="text" class="form-control mb-2 mr-sm-2" id="username" placeholder="IG Username" v-model="settings.username">
      <button type="submit" class="btn btn-primary mb-2"><b-icon icon="search"></b-icon> Search</button>
      <b-button v-b-modal.settings variant="link">Settings</b-button>
    </form>

    <b-modal id="settings" title="Settings" hide-footer>
      <form>
        <div class="form-group">
          <label for="pattern">Price Pattern</label>
          <input type="text" class="form-control" id="pattern" v-model="settings.pattern">
          <small class="form-text text-muted">
            <span v-html="`Use {{price}} as number`"></span>
          </small>
        </div>

        <div class="form-group">
          <label for="shipping">Shipping</label>
          <input type="text" class="form-control" id="shipping" v-model="settings.shipping">
        </div>
      </form>
    </b-modal>

    <Profile v-bind:user="this.settings.user" />

		<div class="gallery">

			<div class="gallery-item" v-for="(item, index) in mediaWithPrice()" v-bind:key="item.id"  v-long-press="300" @long-press-start="() => openMedia(item, index)">

        <label :for="item.id" class="gallery-label">
          <img :src="item.image" class="gallery-image" alt="">
        </label>

        <input class="d-none" type="checkbox" :id="item.id" :value="item" v-model="checked">

        <label :for="item.id" class="gallery-item-info">
          <div class="truncate">{{item.caption}}</div>
          <div class="text-center">
            {{getPrice(item.caption)}} :-
          </div>
        </label>

			</div>

		</div>

    <div class="container footer column-2" v-if="checked.length">
      <div class="text-muted mt-auto mb-auto">
        Total Price: {{ sumText() }} +
        (<span role="link" class="text-primary" v-b-modal.settings>{{ shippingText() }}</span>)
        = {{ sumPrice() }}
      </div>
      <div class="text-right mt-auto mb-auto">
        <b-icon icon="x" font-scale="2" v-on:click="clearChecked()" role="link"></b-icon>
      </div>
    </div>

    <b-modal id="media-info" title="Post Info" hide-footer>
      <div v-if="media.id">
        <b-img :src="media.image" class="w-100 mb-3" />
        <span><strong>{{settings.user.username}}</strong></span>
        <p v-html="newline(media.caption)" />
        <ul>
          <li v-for="item in media.comments" v-bind:key="item.id">
            <strong>{{item.owner.username}}</strong> {{item.text}}
          </li>
        </ul>
      </div>
    </b-modal>
	</div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import LongPress from 'vue-directive-long-press'
import Profile from '@/components/Profile.vue'


export default {
  name: 'Billing',
  components: {
    Profile
  },
  directives: {
    'long-press': LongPress
  },
  data: function () {
    return {
      checked: [],
      media: {},
      settings: {
        username: null,
        user: {},
        media: [],
        pattern: 'ราคา {{price}} บาท',
        shipping: 0
      }
    }
  },
  mounted() {
    if (localStorage.billig_setting) {
      this.settings = JSON.parse(localStorage.billig_setting)
    }
  },
  watch: {
    settings: {
      deep: true,
      handler(settings) {
        localStorage.billig_setting = JSON.stringify(settings)
      }
    }
  },
  methods: {
    fetchUser: function (e) {
      e && e.preventDefault()
      axios.get(`https://www.instagram.com/${this.settings.username}/?__a=1`)
      .then(({ data }) => {
        const user = data.graphql.user
        this.settings.user = {
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
      axios.get(`https://www.instagram.com/graphql/query/?first=50&query_id=17888483320059182&id=${this.settings.user.id}`)
      .then(({ data }) => {
        this.settings.media = data.data.user.edge_owner_to_timeline_media.edges.map(media => {
          const node = media.node
          return {
            id: node.shortcode,
            caption: node.edge_media_to_caption.edges[0].node.text,
            image: node.thumbnail_src,
            comments: undefined
          }
        })
      })
    },
    mediaWithPrice: function () {
      return this.settings.media.filter(({ caption }) => this.getPrice(caption))
    },
    getPrice: function(caption = '') {
      const regex = new RegExp(this.settings.pattern.replace('{{price}}', '([\\d,]+)').replace(/\s+/g, '\\s+'))
      const res = caption.match(regex)
      const price = res && parseInt(res[1].replace(/,/g, ''))
      return price
    },
    shippingText: function () {
      const shipping = Number(this.settings.shipping)
      return shipping ? `${shipping}` : 'Free Shipping'
    },
    sumText: function () {
      const media = this.checked
      const prices = _.map(media, ({ caption }) => this.getPrice(caption))
      return prices.join(' + ')
    },
    sumPrice: function() {
      const media = this.checked
      const shipping = Number(this.settings.shipping)
      const prices = _.map(media, ({ caption }) => this.getPrice(caption))
      return _.sum(prices) + shipping
    },
    clearChecked: function () {
      this.checked = []
    },
    openMedia (item) {
      this.media = JSON.parse(JSON.stringify(item))
      this.$bvModal.show('media-info')
      if (item.comments === undefined) {
        axios.get(`https://www.instagram.com/graphql/query/?query_id=17852405266163336&shortcode=${item.id}&first=50`)
        .then(({ data }) => {
          item.comments = _.map(data.data.shortcode_media.edge_media_to_comment.edges, 'node')
          this.media = item
        })
      }
    },
    newline: text => text.replace(/[\r\n]/g, '<br />')
  }
}
</script>

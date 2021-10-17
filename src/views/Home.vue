<template>
  <div class="search">
    <input type="text" v-model="title" />
    <input type="text" v-model="pref" />
    <input type="text" v-model="city" />
    <button v-on:click="onclick">検索</button>
    <p>{{ isbn }}</p>
    <p>{{ book_info }}</p>
    <p>{{ lib_info }}</p>
    <p>{{ collection_info }}</p>
  </div>
</template>

<script>
import axios from 'axios'
require('dotenv').config()

export default {
  name: 'Home',
  data() {
    return {
      book_info: '',
      isbn: '',
      title: '',
      pref: '',
      city: '',
      lib_info: '',
      collection_info: '',
      continue: 1,
    }
  },

  methods: {
    rakuten_request: function () {
      axios
        .get(
          'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=' +
            process.env.VUE_APP_RAKUTEN_KEY +
            '&title=' +
            this.title +
            '&hits=30&page=1&sort=%2BreleaseDate'
        )
        .then((response) => {
          this.json_books = response['data']
          this.status = response['status']
          console.log(response)
          if (this.status == 200) {
            if (response['hits'] != 0) {
              this.book_info = this.json_books['Items'][0]['Item']
              this.isbn = this.json_books['Items'][0]['Item']['isbn']
              setTimeout(this.library_request, 6000)
            } else {
              this.book_info = '本がヒットしませんでした'
            }
          }
        })
        .catch(() => {
          this.json_books = '取得に失敗しました。'
        })
    },
    library_request: function () {
      axios
        .get(
          'http://api.calil.jp/library?appkey=' +
            process.env.VUE_APP_CALIL_KEY +
            '&pref=' +
            this.pref +
            '&city=' +
            this.city +
            '&limit=15&format=json&callback='
        )
        .then((response) => {
          console.log(response)
          this.status = response['status']

          if (this.status == 200) {
            this.lib_info = response['data']
            if (this.lib_info['length'] != 0) {
              this.lib_sysid = this.lib_info.map((element) => {
                return element['systemid']
              })
              this.lib_sysid = Array.from(new Set(this.lib_sysid))
              this.lib_sysid = this.lib_sysid.join(',')
              this.params =
                '&isbn=' +
                this.isbn +
                '&systemid=' +
                this.lib_sysid +
                '&format=json&callback=no'
              this.continue = 1
              setTimeout(this.book_request, 6000)
            } else {
              this.lib_info = 'ヒット件０件でした'
            }
          } else {
            this.lib_info = '取得に失敗しました'
          }
        })
    },
    book_request: function () {
      if (this.status === 200) {
        if (this.continue === 1) {
          axios
            .get(
              'http://api.calil.jp/check?appkey=' +
                process.env.VUE_APP_CALIL_KEY +
                this.params
            )
            .then((respose) => {
              console.log(respose)
              this.collection_info = respose['data']['books']
              this.status = respose['status']
              this.continue = respose['data']['continue']
              this.params =
                '&session=' + respose['data']['session'] + '&format=json'
              this.continue = 0
              setTimeout(this.book_request, 6000)
            })
        } else {
          console.log('取得が終了しました')
        }
      } else {
        console.log('取得に失敗しました')
      }
    },
    onclick: function () {
      console.log(this.title)
      console.log(this.pref)
      console.log(this.city)
      this.rakuten_request()
    },
  },
}
</script>

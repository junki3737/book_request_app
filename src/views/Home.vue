<template>
  <div class="flex flex-col m-4">
    <div class="w-3/5 mx-auto p-2 border border-solid rounded-lg shadow">
      <h2 class="m-2 border-b text-xl">検索エリア</h2>
      <div class="flex">
        <h4 class="flex-1 m-2 p-1 text-gray-700">タイトル</h4>
        <input
          class="flex-1 m-2 p-1 border-gray-300 shadow"
          type="text"
          v-model="title"
        />
      </div>
      <div class="flex">
        <h4 class="flex-1 p-1 m-2 text-gray-700">都道府県</h4>
        <input class="flex-1 p-1 m-2 shadow" type="text" v-model="pref" />
      </div>
      <div class="flex">
        <h4 class="flex-1 p-1 m-2 text-gray-700">市町村区</h4>
        <input class="flex-1 p-1 m-2 shadow" type="text" v-model="city" />
      </div>
      <button
        class="
          bg-green-500
          hover:bg-green-700
          text-white
          font-bold
          py-2
          px-4
          rounded
        "
        v-on:click="onclick"
      >
        検索
      </button>
    </div>
    <div class="w-3/5 mx-auto p-2">
      <div class="flex justify-between items-center flex-wrap">
        <img class="flex1" v-bind:src="book_info.largeImageUrl" />
        <div class="m-4 flex-1 text-left">
          <div class="mt-62 text-sm text-gray-600">
            <p>{{ book_info.author }}</p>
          </div>
          <h2 class="text-2xl">{{ book_info.title }}</h2>
          <p>{{ book_info.publisherName }}</p>
          <div class="mt-5">
            <p>{{ book_info.itemCaption }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="w-3/5 mx-auto p-2">
      <!-- <h2 class="m-2 border-b text-xl">蔵書検索</h2> -->
      <div class="flex border-b">
        <div class="pl-7 p-3 flex-1 text-left">
          <p>図書館</p>
        </div>
        <div class="pl-7 p-3 flex-1 text-left">
          <p>住所</p>
        </div>
        <div class="pl-7 p-3 flex-1 text-left">
          <p>蔵書状況</p>
        </div>
      </div>
      <div class="flex" v-for="(val, key) in collection_info" :key="key">
        <div
          class="pl-7 p-1 flex-1 text-left"
          v-for="value in libs[key]"
          :key="value"
        >
          <p>{{ value }}</p>
        </div>
        <div class="pl-7 p-1 flex-1 text-left">
          <p>{{ val }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
require('dotenv').config()

export default {
  name: 'Home',
  data() {
    return {
      book_info: {
        author: '著者',
        title: 'タイトル',
        itemCaption: 'キャプション',
        publisherName: '出版社',
        largeImageUrl: require('@/assets/book.png'),
      }, //{},
      isbn: '',
      title: '君の膵臓をたべたい',
      pref: '熊本',
      city: '熊本市',
      libs: {},
      lib_info: {},
      collection_info: {},
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
            '&hits=15&page=1&sort=%2BreleaseDate'
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
            '&limit=20&format=json&callback='
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
              this.libs = this.lib_info.map((element) => {
                return [
                  element['libkey'],
                  element['formal'],
                  element['address'],
                ]
              })
              //console.log(this.libs)
              this.libs = this.libs.reduce(
                (obj, [key, val1, val2]) =>
                  Object.assign(obj, {
                    [key]: [val1, val2], //{ formal: val1, address: val2 },
                  }),
                {}
              )
              console.log(this.libs)
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
              this.cf = respose['data']['books']
              console.log(this.cf)
              this.collection_info =
                this.cf['9784575239058']['Kumamoto_Kumamoto']['libkey']
              console.log(this.collection_info)
              this.status = respose['status']
              this.continue = respose['data']['continue']
              this.params =
                '&session=' + respose['data']['session'] + '&format=json'
              // if (this.continue === 1) {
              //   this.collection_info = {
              //     本館: '貸出中',
              //     東部: '貸出可',
              //     清水: '貸出中',
              //     秋津: '貸出可',
              //     花園: '貸出可',
              //     天明: '貸出可',
              //     とみあい: '貸出可',
              //     プラザ: '貸出中',
              //     植木: '貸出可',
              //   }
              // }

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

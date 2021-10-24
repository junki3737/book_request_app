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
        <h4 class="flex-1 p-1 m-2 text-gray-700">市区町村</h4>
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
    <div class="w-3/5 mx-auto p-2 pt-3">
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
    <div class="w-3/5 mx-auto p-2 pt-3">
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
        <div class="pl-7 p-1 flex-1 text-left border border-solid">
          <p>{{ libs.key[0] }}</p>
        </div>
        <div class="pl-7 p-1 flex-1 text-left border border-solid">
          <a v-bind:href="map + libs.key[1]">{{ libs.key[1] }}</a>
        </div>
        <div class="pl-7 p-1 flex-1 text-left border border-solid">
          <p>{{ val }}</p>
        </div>
        <!-- <div
          class="pl-7 p-1 flex-1 text-left"
          v-for="value in libs[key]"
          :key="value"
        >
          <a class="text-blue-500" v-bind:href="map + value" target="_blank">{{
            value
          }}</a>
        </div>
        <div class="pl-7 p-1 flex-1 text-left">
          <p>{{ val }}</p>
        </div> -->
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
      },
      isbn: '',
      title: '君の膵臓をたべたい',
      pref: '熊本',
      city: '熊本市',
      libs: {},
      lib_info: {},
      collection_info: {},
      continue: 1,
      map: 'https://www.google.com/maps/search/?api=1&query=',
    }
  },

  methods: {
    async request() {
      const response = await axios.get(
        `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.VUE_APP_RAKUTEN_KEY}&title=${this.title}&hits=15&page=1&sort=%2BreleaseDate`
      )
      if (response.status === 200) {
        if (response.hits !== 0) {
          this.book_info = response.data.Items[0].Item
          this.isbn = response.data.Items[0].Item.isbn
          const response2 = await axios.get(
            `http://api.calil.jp/library?appkey=${process.env.VUE_APP_CALIL_KEY}&pref=${this.pref}&city=${this.city}&limit=20&format=json&callback=`
          )
          if (response2.status === 200) {
            //this.lib_info = response2['data']
            if (response2.data.length !== 0) {
              this.lib_sysid = response2.data.map((element) => {
                return element.systemid
              })
              this.libs = response2.data.map((element) => {
                return [element.libkey, element.formal, element.address]
              })
              //console.log(this.libs)
              this.libs = this.libs.reduce(
                (obj, [key, val1, val2]) =>
                  Object.assign(obj, {
                    [key]: [val1, val2],
                  }),
                {}
              )
              console.log(this.libs)
              this.lib_sysid = Array.from(new Set(this.lib_sysid))
              this.lib_sysid = this.lib_sysid.join(',')
              this.params = `&isbn=${this.isbn}&systemid=${this.lib_sysid}&format=json&callback=no`
              this.continue = 1
              this.status = response2.status
              setTimeout(this.book_request, 3000)
            } else {
              // 図書館が一つもヒットしなかったとき
              console.log()
            }
          } else {
            // カーリル図書館APIの返り値が200以外のとき
            console.log()
          }
        } else {
          // 本のヒット数が0のとき
          console.log()
        }
      } else {
        // 楽天APIの返り値が200以外のとき
        console.log()
      }
    },
    async book_request() {
      if (this.status === 200) {
        if (this.continue === 1) {
          let response3 = await axios.get(
            `http://api.calil.jp/check?appkey=${process.env.VUE_APP_CALIL_KEY}${this.params}`
          )
          if (response3.status === 200) {
            this.status == response3.status
            this.collection_info =
              response3.data.books[this.isbn][this.lib_sysid]
            if ('libkey' in this.collection_info) {
              this.collection_info = this.collection_info.libkey
              this.continue = 0
              console.log('no continue')
            } else {
              this.continue = 0 //1
              console.log('continue')
            }
            setTimeout(this.book_request, 4000)
          }
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
      this.request()
    },
  },
}

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
</script>

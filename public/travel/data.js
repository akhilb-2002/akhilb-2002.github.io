/**
 * Travel data.
 *
 * To add a new country:
 *   1. Add an entry keyed by its 2-letter code.
 *   2. `iso` is the ISO 3166-1 numeric code (used by the world map shapes),
 *      e.g. Japan = "392", Germany = "276", France = "250", USA = "840", India = "356".
 *   3. Each photo needs `lat` / `lng` so its pixel pin lands in the right spot.
 *      (Right-click a spot in Google Maps -> the first menu item copies "lat, lng".)
 *   4. `link` is optional; if empty, the pin opens a Google Maps search at lat/lng.
 */
const TRIPS = {
  JP: {
    name: "Japan",
    iso: "392",
    photos: [
      { src: "images/JA/Arashiyama.jpeg", title: "Arashiyama", zone: "Kyoto", lat: 35.0168187, lng: 135.6713013, link: "https://maps.app.goo.gl/c9hedqDD8p5vpw2M8" },
      { src: "images/JA/Chureito_Pagoda.jpeg", title: "Chureito Pagoda", zone: "Fuji", lat: 35.5012626, lng: 138.8013852, link: "https://maps.app.goo.gl/ShzQwHyAD4XpSM3r7" },
      { src: "images/JA/Fushimiinari.jpeg", title: "Fushimi Inari Taisha", zone: "Kyoto", lat: 34.9676945, lng: 135.7791876, link: "https://maps.app.goo.gl/RBoHmHFfQMSUTRuv5" },
      { src: "images/JA/Hakuba_1.jpg", title: "Hakuba", zone: "Nagano", lat: 36.6981614, lng: 137.8619333, link: "https://maps.app.goo.gl/mL6Ty1TAWfckkAPJ6" },
      { src: "images/JA/Hitachi_seaside.jpeg", title: "Hitachi Seaside Park", zone: "Ibaraki", lat: 36.405864, lng: 140.5964868, link: "https://maps.app.goo.gl/7Qkb3HtGvTUGKfKo9" },
      { src: "images/JA/Hokokuji.jpeg", title: "Hokoku-ji", zone: "Kamakura", lat: 35.3199921, lng: 139.5692379, link: "https://maps.app.goo.gl/mUjDSaAmkKVEDYHm8" },
      { src: "images/JA/Kamakura_Daibutsu.jpeg", title: "Kamakura Daibutsu", zone: "Kamakura", lat: 35.3168145, lng: 139.5357442, link: "https://maps.app.goo.gl/z3GoLLTv6oKvxrmMA" },
      { src: "images/JA/Kamakura.jpeg", title: "Kamakura", zone: "Kamakura", lat: 35.3198651, lng: 139.5526056, link: "https://maps.app.goo.gl/z1B9knvngn3Y92PX8" },
      { src: "images/JA/Karuizawa.jpg", title: "Karuizawa", zone: "Nagano", lat: 36.3483927, lng: 138.5970297, link: "https://maps.app.goo.gl/EiVezjj4qq8CCeex9" },
      { src: "images/JA/Kinkakuji.jpeg", title: "Kinkaku-ji", zone: "Kyoto", lat: 35.03937, lng: 135.7292431, link: "https://maps.app.goo.gl/cCWXeBcHy4K6SxZh7" },
      { src: "images/JA/Kiyomizudera.jpeg", title: "Kiyomizu-dera", zone: "Kyoto", lat: 34.9946662, lng: 135.784661, link: "https://maps.app.goo.gl/nXtMa7rGQKu3hpDL8" },
      { src: "images/JA/Lake_Usui.jpg", title: "Lake Usui", zone: "Nagano", lat: 36.3537487, lng: 138.705654, link: "https://maps.app.goo.gl/Y3WeoCjaFHstPtP57" },
      { src: "images/JA/Lake_Yamanaka.jpeg", title: "Lake Yamanaka", zone: "Yamanashi", lat: 35.4185515, lng: 138.8774803, link: "https://maps.app.goo.gl/YhrFJJJkXo5kreAH6" },
      { src: "images/JA/MeijiJingu.jpeg", title: "Meiji Jingu", zone: "Harajuku", lat: 35.6763976, lng: 139.6993259, link: "https://maps.app.goo.gl/fF6PwD4GqCaNF4EJ8" },
      { src: "images/JA/Mocha_cafe.jpeg", title: "Mocha Cafe", zone: "Harajuku", lat: 35.6699929, lng: 139.7030439, link: "https://maps.app.goo.gl/VVxTDYLoLP8fcJcb7" },
      { src: "images/JA/Mt.Goryo.jpg", title: "Mt. Goryu", zone: "Nagano", lat: 36.6584244, lng: 137.7526359, link: "https://maps.app.goo.gl/yvWLSiu2BZatBAzn9" },
      { src: "images/JA/Mt.Takao.jpeg", title: "Mt. Takao", zone: "Tokyo", lat: 35.6254126, lng: 139.2437385, link: "https://maps.app.goo.gl/dg3omdPK1w9YD9Rb8" },
      { src: "images/JA/MtTonodake_entrance.jpg", title: "Mt. Tonodake", zone: "Kanagawa", lat: 35.4541539, lng: 139.1635063, link: "https://maps.app.goo.gl/JgGbZD1Vb3Vz1tRN9" },
      { src: "images/JA/MTTonodake.jpg", title: "Mt. Tonodake", zone: "Kanagawa", lat: 35.4541539, lng: 139.1635063, link: "https://maps.app.goo.gl/JgGbZD1Vb3Vz1tRN9" },
      { src: "images/JA/Odaiba_1.jpeg", title: "Odaiba", zone: "Tokyo", lat: 35.6261048, lng: 139.7762534, link: "https://maps.app.goo.gl/XWuPsaWgSsuwqsou8" },
      { src: "images/JA/Odaiba.jpeg", title: "Odaiba", zone: "Tokyo", lat: 35.6278727, lng: 139.7718346, link: "https://maps.app.goo.gl/yo63n5FShaGf4gadA" },
      { src: "images/JA/Osaka_Castle.jpeg", title: "Osaka Castle", zone: "Osaka", lat: 34.6872571, lng: 135.5258546, link: "https://maps.app.goo.gl/uzqAJbhVndBckcUb6" },
      { src: "images/JA/Oshino_Hakkai.jpeg", title: "Oshino Hakkai", zone: "Yamanashi", lat: 35.4600675, lng: 138.8324741, link: "https://maps.app.goo.gl/iLeqXgoSj9W8qfJp8" },
      { src: "images/JA/Sensoji.jpeg", title: "Senso-ji", zone: "Asakusa", lat: 35.7147651, lng: 139.7966553, link: "https://maps.app.goo.gl/7b24tZMusbeoAUxo6" },
      { src: "images/JA/Shibuya_Crossing.jpg", title: "Shibuya Crossing", zone: "Tokyo", lat: 35.659482, lng: 139.7005596, link: "https://maps.app.goo.gl/XuE46moq2AnTrTjeA" },
      { src: "images/JA/Shibuya.jpg", title: "Shibuya", zone: "Tokyo", lat: 35.6619707, lng: 139.703795, link: "https://maps.app.goo.gl/FFBhPLzkV98VKTEM9" },
      { src: "images/JA/Shinjuku.jpg", title: "Shinjuku", zone: "Tokyo", lat: 35.6938253, lng: 139.7033559, link: "https://maps.app.goo.gl/TNcXxQWs3ZfyVJDP9" },
      { src: "images/JA/Shitennoji.jpeg", title: "Shitenno-ji", zone: "Osaka", lat: 34.6544581, lng: 135.5165239, link: "https://maps.app.goo.gl/6Aay9Rhv2LLkYbY4A" },
      { src: "images/JA/Skytee.jpg", title: "Tokyo Skytree", zone: "Tokyo", lat: 35.7100627, lng: 139.8107004, link: "https://maps.app.goo.gl/p4SUthQRtn8Wc2CF8" },
      { src: "images/JA/Skytree_Deck.jpeg", title: "Tokyo Skytree Deck", zone: "Tokyo", lat: 35.7100627, lng: 139.8107004, link: "https://maps.app.goo.gl/p4SUthQRtn8Wc2CF8" },
      { src: "images/JA/Takaosan.jpeg", title: "Mt. Takao", zone: "Tokyo", lat: 35.6254126, lng: 139.2437385, link: "https://maps.app.goo.gl/dg3omdPK1w9YD9Rb8" },
      { src: "images/JA/Tokyo_Tower.jpeg", title: "Tokyo Tower", zone: "Tokyo", lat: 35.6585805, lng: 139.7454329, link: "https://maps.app.goo.gl/bGNUTeuLJfS3nf92A" },
      { src: "images/JA/Tsuragao_Hachimango.jpeg", title: "Tsurugaoka Hachimangu", zone: "Kamakura", lat: 35.3259856, lng: 139.5563462, link: "https://maps.app.goo.gl/413qbnaYugFnQRyW6" },
      { src: "images/JA/Ueno_Park_2.jpeg", title: "Ueno Park", zone: "Tokyo", lat: 35.7148, lng: 139.7731, link: "" },
      { src: "images/JA/Ueno_Park.jpeg", title: "Ueno Toshogu Shrine", zone: "Tokyo", lat: 35.7153719, lng: 139.7707328, link: "https://maps.app.goo.gl/6u44n3WkwheHbbRt8" }
    ]
  },
  DE: {
    name: "Germany",
    iso: "276",
    photos: [
      { src: "images/DE/Allianz_arena.jpg", title: "Allianz Arena", zone: "Munich", lat: 48.2187955, lng: 11.6246888, link: "https://maps.app.goo.gl/8mhwsWBLRk4afxr76" },
      { src: "images/DE/Berlin_Cathedral.jpg", title: "Berlin Cathedral", zone: "Berlin", lat: 52.5190608, lng: 13.401078, link: "https://maps.app.goo.gl/UCzsVSkUbdmYKBae6" },
      { src: "images/DE/Berlin_Wall.jpg", title: "Berlin Wall", zone: "Berlin", lat: 52.5096488, lng: 13.3759441, link: "https://maps.app.goo.gl/YPkoG9jertjfhBhRA" },
      { src: "images/DE/Brandenburg_Gate.jpeg", title: "Brandenburg Gate", zone: "Berlin", lat: 52.5162746, lng: 13.3777041, link: "https://maps.app.goo.gl/p3tEtxXQ26iVHMsbA" },
      { src: "images/DE/Cologne_Cathedral.jpg", title: "Cologne Cathedral", zone: "Cologne", lat: 50.9412784, lng: 6.9582814, link: "https://maps.app.goo.gl/u7gj6WFysF1TeNYJ9" },
      { src: "images/DE/Cologne.jpg", title: "Streets of Cologne", zone: "Cologne", lat: 50.937531, lng: 6.9602786, link: "https://maps.app.goo.gl/2ZDfbL758ir4JpX36" },
      { src: "images/DE/Dusseldorf_street.jpg", title: "Streets of Dusseldorf", zone: "Dusseldorf", lat: 51.2230411, lng: 6.7824545, link: "https://maps.app.goo.gl/fJRHNSfythv6xyRi8" },
      { src: "images/DE/Dusseldorf_towe.jpg", title: "Dusseldorf Tower", zone: "Dusseldorf", lat: 51.2179423, lng: 6.7616801, link: "https://maps.app.goo.gl/Ayp6na2cLdZ1idyU6" },
      { src: "images/DE/Garmisch-Partenkirchen.jpg", title: "Garmisch-Partenkirchen", zone: "Bavaria", lat: 47.4919023, lng: 11.0947806, link: "https://maps.app.goo.gl/ka1p1NTwh4wLB45VA" },
      { src: "images/DE/German_chancellary.jpg", title: "German Chancellery", zone: "Berlin", lat: 52.5201007, lng: 13.3692184, link: "https://maps.app.goo.gl/qnv5t54AtZU5z1Qm6" },
      { src: "images/DE/HNF.jpg", title: "Heinz Nixdorf Institute", zone: "Paderborn", lat: 51.7314381, lng: 8.7357808, link: "https://maps.app.goo.gl/xscGjJwjSdkWpBdo7" },
      { src: "images/DE/Munich_BMW.jpg", title: "Munich BMW Museum", zone: "Munich", lat: 48.1768304, lng: 11.5590966, link: "https://maps.app.goo.gl/eut68AqZNMK6Sibp7" },
      { src: "images/DE/Paderborn_wheel.jpg", title: "Paderborn Wheel", zone: "Paderborn", lat: 51.7189205, lng: 8.7575093, link: "https://maps.app.goo.gl/dK2G4FV8gqRqT7t86" },
      { src: "images/DE/Paderborn.jpg", title: "Paderborn", zone: "Paderborn", lat: 51.7189205, lng: 8.7575093, link: "https://maps.app.goo.gl/dK2G4FV8gqRqT7t86" },
      { src: "images/DE/Schloss_Neuschwenstein.jpg", title: "Schloss Neuschwanstein", zone: "Bavaria", lat: 47.557574, lng: 10.7498004, link: "https://maps.app.goo.gl/LsSpV8DvEqWpBQAfA" },
      { src: "images/DE/Schloss.jpg", title: "Neuschwanstein from the bus stop", zone: "Bavaria", lat: 47.557574, lng: 10.7498004, link: "https://maps.app.goo.gl/LsSpV8DvEqWpBQAfA" },
      { src: "images/DE/Schwangau.jpg", title: "Schwangau", zone: "Bavaria", lat: 47.5494246, lng: 10.7247029, link: "https://maps.app.goo.gl/GUrrh53pGwdpMa9V8" }
    ]
  }
};

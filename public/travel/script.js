/**
 * ---------------------------------------
 * This demo was created using amCharts 5.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v5/
 * ---------------------------------------
 */

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
var root = am5.Root.new("chartdiv");


// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root)
]);

// List of visited country codes
const visitedCountries = ["JP", "DE"];

const countryImages = {
  "JP": [
    { src: "images/JA/Arashiyama.jpeg", photoBy: "Arashiyama", zone: "Kyoto", link: "https://maps.app.goo.gl/c9hedqDD8p5vpw2M8"},
    { src: "images/JA/Chureito_Pagoda.jpeg", photoBy: "Chureito Pagoda", zone: "Fuji", link: "https://maps.app.goo.gl/ShzQwHyAD4XpSM3r7" },
    { src: "images/JA/Fushimiinari.jpeg", photoBy: "Fushimi Inari Taisha", zone: "Kyoto", link: "https://maps.app.goo.gl/RBoHmHFfQMSUTRuv5"},
    { src: "images/JA/Hakuba_1.jpg", photoBy: "Hakuba", zone: "Nagano", link: "https://maps.app.goo.gl/mL6Ty1TAWfckkAPJ6"},
    { src: "images/JA/Hitachi_seaside.jpeg", photoBy: "Hitachi Seaside Park", zone: "Ibaraki", link: "https://maps.app.goo.gl/7Qkb3HtGvTUGKfKo9" },
    { src: "images/JA/Hokokuji.jpeg", photoBy: "Hokoku-ji", zone: "Kamakura", link: "https://maps.app.goo.gl/mUjDSaAmkKVEDYHm8"},
    { src: "images/JA/Kamakura_Daibutsu.jpeg", photoBy: "Kamakura Daibutsu", zone: "Kamakura" , link: "https://maps.app.goo.gl/z3GoLLTv6oKvxrmMA"},
    { src: "images/JA/Kamakura.jpeg", photoBy: "Kamakura", zone: "Kamakura" , link: "https://maps.app.goo.gl/z1B9knvngn3Y92PX8"},
    { src: "images/JA/Karuizawa.jpg", photoBy: "Karuizawa", zone: "Nagano" , link: "https://maps.app.goo.gl/EiVezjj4qq8CCeex9"},
    { src: "images/JA/Kinkakuji.jpeg", photoBy: "Kinkaku-ji", zone: "Kyoto" , link: "https://maps.app.goo.gl/cCWXeBcHy4K6SxZh7"},
    { src: "images/JA/Kiyomizudera.jpeg", photoBy: "Kiyomizu-dera", zone: "Kyoto" , link: "https://maps.app.goo.gl/nXtMa7rGQKu3hpDL8"},
    { src: "images/JA/Lake_Usui.jpg", photoBy: "Lake Usui", zone: "Nagano", link: "https://maps.app.goo.gl/Y3WeoCjaFHstPtP57" },
    { src: "images/JA/Lake_Yamanaka.jpeg", photoBy: "Lake Yamanaka", zone: "Yamanashi" , link: "https://maps.app.goo.gl/YhrFJJJkXo5kreAH6"},
    { src: "images/JA/MeijiJingu.jpeg", photoBy: "Meiji Jingu", zone: "Harajuku" , link: "https://maps.app.goo.gl/fF6PwD4GqCaNF4EJ8"},
    { src: "images/JA/Mocha_cafe.jpeg", photoBy: "Mocha Cafe", zone: "Harajuku", link: "https://maps.app.goo.gl/VVxTDYLoLP8fcJcb7" },
    { src: "images/JA/Mt.Goryo.jpg", photoBy: "Mt. Goryu", zone: "Nagano" , link: "https://maps.app.goo.gl/yvWLSiu2BZatBAzn9"},
    { src: "images/JA/Mt.Takao.jpeg", photoBy: "Mt. Takao", zone: "Tokyo" , link: "https://maps.app.goo.gl/dg3omdPK1w9YD9Rb8"},
    { src: "images/JA/MtTonodake_entrance.jpg", photoBy: "Mt. Tonodake", zone: "Kanagawa" , link: "https://maps.app.goo.gl/JgGbZD1Vb3Vz1tRN9"},
    { src: "images/JA/MTTonodake.jpg", photoBy: "Mt. Tonodake", zone: "Kanagawa" , link: "https://maps.app.goo.gl/JgGbZD1Vb3Vz1tRN9"},
    { src: "images/JA/Odaiba_1.jpeg", photoBy: "Odaiba", zone: "Tokyo" , link: "https://maps.app.goo.gl/XWuPsaWgSsuwqsou8"},
    { src: "images/JA/Odaiba.jpeg", photoBy: "Odaiba", zone: "Tokyo" , link: "https://maps.app.goo.gl/yo63n5FShaGf4gadA"},
    { src: "images/JA/Osaka_Castle.jpeg", photoBy: "Osaka Castle", zone: "Osaka" , link: "https://maps.app.goo.gl/uzqAJbhVndBckcUb6"},
    { src: "images/JA/Oshino_Hakkai.jpeg", photoBy: "Oshino Hakkai", zone: "Yamanashi" , link: "https://maps.app.goo.gl/iLeqXgoSj9W8qfJp8"},
    { src: "images/JA/Sensoji.jpeg", photoBy: "Senso-ji", zone: "Asakusa" , link: "https://maps.app.goo.gl/7b24tZMusbeoAUxo6"},
    { src: "images/JA/Shibuya_Crossing.jpg", photoBy: "Shibuya Crossing", zone: "Tokyo" , link: "https://maps.app.goo.gl/XuE46moq2AnTrTjeA"},
    { src: "images/JA/Shibuya.jpg", photoBy: "Shibuya", zone: "Tokyo" , link: "https://maps.app.goo.gl/FFBhPLzkV98VKTEM9"},
    { src: "images/JA/Shinjuku.jpg", photoBy: "Shinjuku", zone: "Tokyo" , link: "https://maps.app.goo.gl/TNcXxQWs3ZfyVJDP9"},
    { src: "images/JA/Shitennoji.jpeg", photoBy: "Shitenno-ji", zone: "Osaka" , link: "https://maps.app.goo.gl/6Aay9Rhv2LLkYbY4A"},
    { src: "images/JA/Skytee.jpg", photoBy: "Tokyo Skytree", zone: "Tokyo" , link: "https://maps.app.goo.gl/p4SUthQRtn8Wc2CF8" },
    { src: "images/JA/Skytree_Deck.jpeg", photoBy: "Tokyo Skytree Deck", zone: "Tokyo", link: "https://maps.app.goo.gl/p4SUthQRtn8Wc2CF8" },
    { src: "images/JA/Takaosan.jpeg", photoBy: "Mt. Takao", zone: "Tokyo" , link: "https://maps.app.goo.gl/dg3omdPK1w9YD9Rb8"},
    { src: "images/JA/Tokyo_Tower.jpeg", photoBy: "Tokyo Tower", zone: "Tokyo" , link: "https://maps.app.goo.gl/bGNUTeuLJfS3nf92A"},
    { src: "images/JA/Tsuragao_Hachimango.jpeg", photoBy: "Tsurugaoka Hachimangu", zone: "Kamakura" , link: ""},
    { src: "images/JA/Ueno_Park_2.jpeg", photoBy: "Ueno Park", zone: "Tokyo" , link: "https://maps.app.goo.gl/413qbnaYugFnQRyW6"},
    { src: "images/JA/Ueno_Park.jpeg", photoBy: "Ueno Toshogu Shrine", zone: "Tokyo" , link: "https://maps.app.goo.gl/6u44n3WkwheHbbRt8"}
  ],
  "DE": [
    { src: "images/DE/Allianz_arena.jpg", photoBy: "Allianz Arena", zone: "Munich", link: "https://maps.app.goo.gl/8mhwsWBLRk4afxr76" },
    { src: "images/DE/Berlin_Cathedral.jpg",  photoBy: "Berlin Cathedral", zone: "Berlin", link: "https://maps.app.goo.gl/UCzsVSkUbdmYKBae6"  },
    { src: "images/DE/Berlin_Wall.jpg", photoBy: "Berlin Wall", zone: "Berlin" , link: "https://maps.app.goo.gl/YPkoG9jertjfhBhRA" },
    { src: "images/DE/Brandenburg_Gate.jpeg", photoBy: "Brandenburg Gate", zone: "Berlin" , link: "https://maps.app.goo.gl/p3tEtxXQ26iVHMsbA" },
    { src: "images/DE/Cologne_Cathedral.jpg", photoBy: "Cologne Cathedral", zone: "Cologne" , link: "https://maps.app.goo.gl/u7gj6WFysF1TeNYJ9" },
    { src: "images/DE/Cologne.jpg", photoBy: "Streets of Cologne", zone: "Cologne", link: "https://maps.app.goo.gl/2ZDfbL758ir4JpX36"  },
    { src: "images/DE/Dusseldorf_street.jpg", photoBy: "Streets of Dusseldorf", zone: "Dusseldorf", link: "https://maps.app.goo.gl/fJRHNSfythv6xyRi8"  },
    { src: "images/DE/Dusseldorf_towe.jpg", photoBy: "Dusseldorf Tower", zone: "Dusseldorf" , link: "https://maps.app.goo.gl/Ayp6na2cLdZ1idyU6" },
    { src: "images/DE/Garmisch-Partenkirchen.jpg", photoBy: "Garmisch-Partenkirchen", zone: "Bavaria" , link: "https://maps.app.goo.gl/ka1p1NTwh4wLB45VA" },
    { src: "images/DE/German_chancellary.jpg", photoBy: "German Chancellery", zone: "Berlin" , link: "https://maps.app.goo.gl/qnv5t54AtZU5z1Qm6" },
    { src: "images/DE/HNF.jpg", photoBy: "Heinz Nixdorf Institute", zone: "Paderborn" , link: "https://maps.app.goo.gl/xscGjJwjSdkWpBdo7" },
    { src: "images/DE/Munich_BMW.jpg", photoBy: "Munich BMW Museum", zone: "Munich" , link: "https://maps.app.goo.gl/eut68AqZNMK6Sibp7" },
    { src: "images/DE/Paderborn_wheel.jpg", photoBy: "Paderborn Wheel", zone: "Paderborn", link: "https://maps.app.goo.gl/dK2G4FV8gqRqT7t86"  },
    { src: "images/DE/Paderborn.jpg", photoBy: "Paderborn", zone: "Paderborn" , link: "https://maps.app.goo.gl/dK2G4FV8gqRqT7t86" },
    { src: "images/DE/Schloss_Neuschwenstein.jpg", photoBy: "Schloss Neuschwanstein", zone: "Bavaria" , link: "https://maps.app.goo.gl/LsSpV8DvEqWpBQAfA" },
    { src: "images/DE/Schloss.jpg", photoBy: "Neuschwenstein from the bus stop", zone: "Bavaria", link: "https://maps.app.goo.gl/LsSpV8DvEqWpBQAfA"  },
    { src: "images/DE/Schwangau.jpg", photoBy: "Schwangau", zone: "Bavaria", link: "https://maps.app.goo.gl/GUrrh53pGwdpMa9V8"  }
  ]
};


// Create the map chart
// https://www.amcharts.com/docs/v5/charts/map-chart/
var chart = root.container.children.push(am5map.MapChart.new(root, {
  panX: "rotateX",
  panY: "rotateY",
  projection: am5map.geoOrthographic(),
  paddingBottom: 20,
  paddingTop: 20,
  paddingLeft: 20,
  paddingRight: 20,
  rotationY: -20 // Add tilt to the globe (20 degrees latitude)
}));



// Create main polygon series for countries
// https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
  geoJSON: am5geodata_worldLow 
}));

polygonSeries.mapPolygons.template.setAll({
  tooltipText: "{name}",
  toggleKey: "active",
  fill: am5.color(0x997f5a),
  interactive: true
});

polygonSeries.mapPolygons.template.states.create("hover", {
  fill: am5.color(0x809459) 
});

polygonSeries.mapPolygons.template.states.create("active", {
  fill: am5.color(0x809459) 
});


// Create series for background fill
// https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
backgroundSeries.mapPolygons.template.setAll({
  fill:  am5.color(0x997f5a),
  stroke: am5.color(0x997f5a),
  
  fillOpacity: 0.1,
  strokeOpacity: 0
});
backgroundSeries.data.push({
  geometry: am5map.getGeoRectangle(90, 180, -90, -180)
});

// Remove graticule (grid) lines
// var graticuleSeries = chart.series.unshift(
//   am5map.GraticuleSeries.new(root, {
//     step: 10
//   })
// );
//
// graticuleSeries.mapLines.template.set("strokeOpacity", 0.1)

// Set up events
var previousPolygon;
let countrySwiper = null; // Variable to hold the Swiper instance

polygonSeries.mapPolygons.template.on("active", function(active, target) {
  if (previousPolygon && previousPolygon != target) {
    previousPolygon.set("active", false);
  }
  if (target.get("active")) {
    selectCountry(target.dataItem.get("id"));
  }
  previousPolygon = target;
});

function selectCountry(id) {
  var dataItem = polygonSeries.getDataItemById(id);
  var target = dataItem.get("mapPolygon");
  if (target) {
    var centroid = target.geoCentroid();
    if (centroid) {
      chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
    }

    // Populate and show Swiper carousel
    const swiperWrapper = document.querySelector("#countrySwiper .swiper-wrapper");
    const countrySwiperElement = document.getElementById("countrySwiper");
    const photoGalleryElement = document.getElementById("photo-gallery");

    swiperWrapper.innerHTML = ""; // Clear previous slides

    const images = countryImages[id];
    if (images && images.length > 0) {
      images.forEach(imgData => {
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");
        slide.style.backgroundImage = `url(${imgData.src})`;

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("info");
        // Updated to show only Photo By and Zone
        infoDiv.innerHTML = `
          <span>${imgData.photoBy || 'N/A'}</span>
          <span> ${imgData.zone || 'N/A'}</span>
        `;
        slide.appendChild(infoDiv);

        // Add a click event listener to open the link
        if (imgData.link) {
          slide.addEventListener("click", function() {
            window.open(imgData.link, "_blank");
          });
        }

        swiperWrapper.appendChild(slide);
      });

      countrySwiperElement.style.display = "block";
      photoGalleryElement.style.display = "none"; // Hide the old gallery

      if (countrySwiper) {
        countrySwiper.destroy(true, true);
      }
      countrySwiper = new Swiper(".swiper", {
        effect: "coverflow",
        loop: true,
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "1",
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        },
        pagination: {
          el: ".swiper-pagination"
        },
        breakpoints: {
          320: { slidesPerView: 1.5 },
          580: { slidesPerView: 2 },
          767: { slidesPerView: 3 },
          992: { slidesPerView: 3.5 },
          1200: { slidesPerView: 4 },
          1400: { slidesPerView: 4.5 }
        }
      });
    } else {
      swiperWrapper.innerHTML = `<p style="text-align:center; width:100%; color:#888; font-size:1.1em; margin:2em 0;">No photos available for this country 😔</p>`;
      countrySwiperElement.style.display = "block"; // Show swiper to display the message
      photoGalleryElement.style.display = "none"; // Hide the old gallery
      if (countrySwiper) {
        countrySwiper.destroy(true, true);
        countrySwiper = null;
      }
    }
  }
}

// Uncomment this to pre-center the globe on a country when it loads
//polygonSeries.events.on("datavalidated", function() {
//  selectCountry("AU");
//});


// Animate rotation with tilt
function startGlobeRotation() {
  chart.animate({
    key: "rotationX",
    to: chart.get("rotationX") + 360,
    duration: 30000,
    loops: Infinity,
    easing: am5.ease.linear
  });
}

// Start rotation on load
startGlobeRotation();

// Make stuff animate on load
chart.appear(1000, 100);

polygonSeries.mapPolygons.template.adapters.add("fill", function(fill, target) {
  const id = target.dataItem && target.dataItem.get("id");
  if (visitedCountries.includes(id)) {
    return am5.color(0x92b54e); 
  }
  return fill;
});
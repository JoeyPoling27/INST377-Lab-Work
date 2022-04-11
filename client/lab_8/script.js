function getRandomIntInclusive(min, max) {
    newMin = Math.ceil(min);
    newMax = Math.floor(max);
    return Math.floor(
      Math.random() * (newMax - newMin + 1) + newMin
      ); //The maximum is inclusive and the minimum is inclusive
  }
  
  function restoArrayMake(dataArray) {
    // console.log('fired dataHandler');
    // console.table(dataArray); // this is called "dot notation"
    const range = [...Array(15).keys()];
    const listItems = range.map((item, index) => {
      const resNum = getRandomIntInclusive(0, dataArray.length - 1);
      return dataArray[resNum];
    });
  
    // console.log(listItems);
    return listItems;
  }
  
  function createHtmlList(collection) {
    console.log(collection);
    const targetList = document.querySelector('.resto-list')
    targetList.innerHTML = '';
    collection.forEach((item) => {
      const {name} = item;
      const displayName = 'Restaurant Name: ' + name.toLowerCase();
      const displayCity = 'City: ' + item.city.toLowerCase();
      const injectThisItem = `<li>${displayName}</li>`;
      const injectThisItemCity = `<li>${displayCity}</li>`;
      targetList.innerHTML += injectThisItem + injectThisItemCity + `</br>`;
    });
  }

  function initMap() {
    const latLong = [38.7849, -76.8721]
    map = map = L.map('map').setView(latLong, 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    }).addTo(map);
    return map;
  }

  function addMapMarkers(map, collection) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    collection.forEach(item => {
      const point = item.geocoded_column_1?.coordinates;
      console.log(item.geocoded_column_1?.coordinates);
      L.marker([point[1], point[0]]).addTo(map);
    });
  }
  
  function refreshList (target, storage) {
    target.addEventListener('click', async(event) => {
      event.preventDefault();
      localStorage.clear();
      const results = await fetch('/api/foodServicesPG');
      const arrayFromJson = await results.json();
      localStorage.setItem(storage, JSON.stringify(arrayFromJson.data));
      location.reload();
    });
  }

  function inputListener(target) {
    target.addEventListener('input', async(event) => {
      const selectResto = storedDataArray.filter((item) => {
        const lowerName = item.name.toLowerCase();
        const lowerValue = item.value.toLowerCase();
        return lowerName.includes(lowerValue);
      });

      createHtmlList(selectResto);
    });
  }
  
  async function mainEvent() { // the async keyword means we can make API requests
    console.log('script loaded');
    const form = document.querySelector('.main_form');
    const submit = document.querySelector('.submit_button');
    
    const resto = document.querySelector('#resto_name');
    const restoCity = document.querySelector('#resto_city');
    const refresh = document.querySelector('#refresh_list');
    const map = initMap();
    const retrievalVar = 'restaurants';
    submit.style.display = 'none';

    refreshList(refresh, retrievalVar);

    const storedData = localStorage.getItem(retrievalVar);
    const storedDataArray = JSON.parse(storedData);
    console.log(storedDataArray)
    // const arrayFromJson = {data: []};


    if (localStorage.getItem(retrievalVar) !== undefined) {
      const results = await fetch('/api/foodServicesPG'); // This accesses some data from our API
      const arrayFromJson = await results.json(); // This changes it into data we can use - an object
      console.log(arrayFromJson);
      localStorage.setItem(retrievalVar, JSON.stringify(arrayFromJson.data));
    }
    // Prevent race condition on data load
    if(storedDataArray?.length > 0){
      submit.style.display = 'block';
      //Sort by name
      let currentRestoArray = [];
      resto.addEventListener('input', async(event) => {
        if (currentRestoArray.length < 1) {
          return;
        }
        // console.log(event.target.value);
        const selectResto = currentRestoArray.filter((resto) => {
          const lowerName = resto.name.toLowerCase();
          const lowerValue = event.target.value.toLowerCase();
          return lowerName.includes(lowerValue);
        });
        createHtmlList(selectResto);
        addMapMarkers(map, selectResto);
      });

      //Sort by city
      restoCity.addEventListener('input', async(event) => {
        // if (currentRestoArray.length < 1) {
        //   return;
        // }
        console.log(event.target.value);
        const selectRestoCity = currentRestoArray.filter((restoCity) => {
          const lowerName = restoCity.city.toLowerCase();
          const lowerValue = event.target.value.toLowerCase();
          return lowerName.includes(lowerValue);
        });
        createHtmlList(selectRestoCity);
        addMapMarkers(map, selectRestoCity);
      });

      form.addEventListener('submit', async (submitEvent) => { // async has to be declared all the way to get an await
        submitEvent.preventDefault(); // This prevents your page from refreshing!
        // console.log('form submission'); // this is substituting for a "breakpoint"
        // arrayFromJson.data - we're accessing a key called 'data' on the returned object
        // it contains all 1,000 records we need
        currentRestoArray = restoArrayMake(storedDataArray);
        console.log(currentRestoArray);
        createHtmlList(currentRestoArray);
        addMapMarkers(map, currentRestoArray);
      });
    }
  }
  
  // this actually runs first! It's calling the function above
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
  
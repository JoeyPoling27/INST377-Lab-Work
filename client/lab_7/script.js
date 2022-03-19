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
  
  function createHtmlList(collection){
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
  
  async function mainEvent() { // the async keyword means we can make API requests
    console.log('script loaded');
    const form = document.querySelector('.main_form');
    const submit = document.querySelector('.submit_button')
    const resto = document.querySelector('#resto_name');
    const restoCity = document.querySelector('#resto_city');
    submit.style.display = 'none';

    const results = await fetch('/api/foodServicesPG'); // This accesses some data from our API
    const arrayFromJson = await results.json(); // This changes it into data we can use - an object
    // console.log(arrayFromJson);

    // Prevent race condition on data load
    if(arrayFromJson.data.length > 0){
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
      });

      //Sort by city
      restoCity.addEventListener('input', async(event) => {
        if (currentRestoArray.length < 1) {
          return;
        }
        // console.log(event.target.value);
        const selectRestoCity = currentRestoArray.filter((restoCity) => {
          const lowerName = restoCity.city.toLowerCase();
          const lowerValue = event.target.value.toLowerCase();
          return lowerName.includes(lowerValue);
        });
        createHtmlList(selectRestoCity);
      });

      form.addEventListener('submit', async (submitEvent) => { // async has to be declared all the way to get an await
        submitEvent.preventDefault(); // This prevents your page from refreshing!
        // console.log('form submission'); // this is substituting for a "breakpoint"
        // arrayFromJson.data - we're accessing a key called 'data' on the returned object
        // it contains all 1,000 records we need
        currentRestoArray = restoArrayMake(arrayFromJson.data);
        createHtmlList(currentRestoArray);
        
      });
    }
  }
  
  // this actually runs first! It's calling the function above
  document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
  
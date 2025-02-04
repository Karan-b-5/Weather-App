const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-details-container")

const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container")
const userInfoContainer = document.querySelector(".weather-info-container")


let currentTab = userTab;  
const API_Key = "YOUR_API_KEY";  // API_KEY of the API which we will be using...
currentTab.classList.add("current-tab")


getFromSessionStorage(); 


// --------- Functions 

function switchTab(clickedTab) {
    if(clickedTab != currentTab){
        document.querySelector('.error').classList.remove('active');
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}


function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates") 
    if(!localCoordinates){
        grantAccessContainer.classList.add("active")
    }
    else{
        const coordinates = JSON.parse(localCoordinates); 
        fetchUserWeatherInfo(coordinates);
        grantAccessContainer.classList.remove("active")
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // grantAccessContainer.classList.add("remove");
    grantAccessContainer.classList.remove("active")
    document.querySelector('.error').classList.remove('active');
    loadingScreen.classList.add("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`);
        
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error){
        loadingScreen.classList.remove("active");
        // 
    }
}


function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryFlag]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");

     //DIY : Handling Error when the city is not found...
     if(weatherInfo?.cod === "404"){ 
        userInfoContainer.classList.remove("active");
        document.querySelector('.error').classList.add('active');
        window.alert("Enter Correct Location")
        return ;
    }

    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all} %`;
}


function getLocation() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        window.alert("Support for Geolocation Api Not Available")
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}


// -------------- Adding Event Listeners 
userTab.addEventListener("click" , () => {
    switchTab(userTab);
});

searchTab.addEventListener("click" , () => {
    switchTab(searchTab);
});


const grantAccessButton = document.querySelector("[data-grantAccess]")
grantAccessButton.addEventListener('click', getLocation);


const searchInput = document.querySelector("[data-searchInput]")
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "")
        return ;
    else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    document.querySelector('.error').classList.remove('active');

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`);
        const data = await response.json();
        
        // remove the loader and display the weather info container
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        // Handle the Error...
        window.alert("An Error Occured")
    }

}
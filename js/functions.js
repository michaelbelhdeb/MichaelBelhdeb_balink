const BASE_URL = 'https://www.metaweather.com/';

const TITLE = document.querySelector('#title');
const SELECT = document.querySelector('#selCountry');
const DAYS = document.querySelector('#days');
const LOCATION = document.querySelector('#country-meteo');
const TIMES = document.querySelector('#country-times');
const LANG = document.querySelector('#language');
const SOURCES = document.querySelector('#listSources');
const TITLE_SRC = document.querySelector('#titleSources');
const FAVICON = 'https://s2.googleusercontent.com/s2/favicons?domain=';

function selectCountry(date = '')
{
    SELECT.addEventListener('change', () => {
        reinitialize();
        let woeid = SELECT.value;
        let langId = LANG.value;
        if(date){
            getMeteoWithDate(woeid, langId, date);
        }
        else{
            getMeteo(woeid, langId);
        }
            
    });
}

// empty all the results of the selection
function reinitialize()
{
    if(DAYS){
        DAYS.innerHTML = '';
    }
    if(LOCATION){
        LOCATION.innerHTML = '';
    }
    if(TIMES){
        TIMES.innerHTML = '' ;
    }
    if(SOURCES){
        SOURCES.innerHTML = '' ;
    }
}

// Call the the API of metweather according to the city's id, language, insert the meteo card(s) in the page
function getMeteo(woeid, langId)
{
    let mapLang = mapEnglish;
    if( langId == 1 ){
        mapLang = mapHebrew;
    }

    let labelTime = mapLang.get("Time");
    let labelSunrise = mapLang.get("Sunrise");
    let labelSunset = mapLang.get("Sunset");

    let url = BASE_URL + 'api/location/' + woeid;
    fetch(url)
        .then( response => response.json() )
        .then( data => {
            const {consolidated_weather, parent, sources, sun_rise, sun_set, time, title, timezone, ...rest} = data;
            const {title : country, ...rest2} = parent;
            console.log(data);
            LOCATION.innerHTML = `<div class='city ml'>` + mapLang.get(title) + ', ' + `<span class='country'>` + mapLang.get(country) + `</span></div>`;
            TIMES.innerHTML = 
                `<ul id='times'>
                    <li><div id='time' class='title'><label>` + labelTime + `</label></div><div class='time'>&nbsp;` + shortTime(time, timezone) + `</div></li>
                    <li><div id='sunrise' class='title'><label>` + labelSunrise + `</label></div><div class='time'>&nbsp;` + shortTime(sun_rise, timezone) + `</div></li>
                    <li><div id='sunset' class='title'><label>` + labelSunset + `</label></div><div class='time'>&nbsp;` + shortTime(sun_set, timezone) + `</div></li>
                </ul>`;
            Object.entries(consolidated_weather).forEach(
                ([key, value]) => {
                    DAYS.innerHTML += card(key, value, langId);
                }
            )
        })
}

// Call the the API of metweather according to the city's id, language and date, insert the meteo card in the page, and the sources
function getMeteoWithDate(woeid, langId, date)
{
    let mapLang = mapEnglish;
    if( langId == 1 ){
        mapLang = mapHebrew;
    }

    TITLE_SRC.innerHTML = mapLang.get("Sources");

    if(date !== ''){
        date = '/' + date.split('-').join('/');
    }

    let url = BASE_URL + 'api/location/' + woeid;
    let urlDate =  url + date;

    fetch(url)
        .then( response => response.json() )
        .then( data => {
            const {sources, title, ...rest} = data;
            LOCATION.innerHTML = `<div class='city ml'>` + mapLang.get(title) + `</div>`;
            sources.forEach(
                (value) => {
                    SOURCES.innerHTML += source(value);
                }
            )
            
            fetch(urlDate)
                .then( response => response.json() )
                .then( data => {
                    let consolitedWeather = data[0];
                    LOCATION.innerHTML += `<div class='ml'>` + card(date, consolitedWeather, langId) + `</div>`;
                })
        })
}

// Create HTML for a day meteo card, with the infos of the day
function card(key, value, langId = 0)
{
    let mapLang = mapEnglish;
    if( langId == 1 ){
        mapLang = mapHebrew;
    }

    let lblMax = mapLang.get("Max");
    let lblMin = mapLang.get("Min");
    let lblSpeed = mapLang.get("mph");
    let lblHumidity = mapLang.get("Humidity");
    let lblVisibility = mapLang.get("Visibility");
    let lblPressure = mapLang.get("Pressure");
    let lblConfidence = mapLang.get("Confidence");
    
    let day;

    switch(key) {
        case '0': {
            day = mapLang.get('Today');
            break;
        }
        case '1': {
            day = mapLang.get('Tomorrow');
            break;
        }
        default: {
            day = translateDate(value.applicable_date, langId);
            break;
        }
    }

    let card = `
    <li id='day` + key +`' class='card'>
        <span class='date-day mb1'><a href='specificDate.html?date=` + value.applicable_date + `'>` + day + `</a></span>
        <span class='img-day mb1'>
            <img src="` + BASE_URL +`static/img/weather/png/64/` + value.weather_state_abbr + `.png" alt="` + value.weather_state_name + `">
            ` + value.weather_state_name + `
        </span>
        <span><span class='fl'>` + lblMax + `</span>&nbsp;` + Math.round(value.max_temp) + `°C</span>
        <span class='mb1'><span class='fl'>` + lblMin + `</span>&nbsp;` + Math.round(value.min_temp) + `°C</span>
        <span class='mb1'>` + Math.round(value.wind_speed) + lblSpeed +`</span>
        <label for='humidity'>` + lblHumidity + `</label>
        <span>` + Math.round(value.humidity) + `%</span>
        <label>` + lblVisibility + `</label>
        <span>` + value.visibility.toFixed(1) + ` miles</span>
        <label>` + lblPressure + `</label>
        <span class='mb1'>` + value.air_pressure + `mb</span>
        <label>` + lblConfidence + `</label>
        <span class='mb1'>` + value.predictability + `%</span>
    </li>`;

    return card;
}

// Create HTML for a line of meteo source
function source(dataSource)
{
    const {title, url, ...rest} = dataSource;

    let src = `
    <li class='source'>
        <span class='date-day mb1'>
            <img src='` + FAVICON + url + `' alt='` + title + `'/>&nbsp;
            <span><a href='` + url + `'>` + title + `</a></span>
        </span>
    </li>`;

    return src;
}

// turns a datetime to a date in letters 
function translateDate(date, lang = 0)
{
    let mapDay = mapDaysEn;
    let mapMonth = mapMonthsEn;
    if( lang == 1){
        mapDay = mapDaysHe;
        mapMonth = mapMonthsHe;
    }

    let d = new Date(date);

    return mapDay.get(d.getDay()) + ' ' + d.getDate() + ' ' + mapMonth.get(d.getMonth());
}

// turns a datetime to a short time
function shortTime(time, timeZone)
{
    return new Date(time).toLocaleTimeString("en-US", {timeStyle: 'short', timeZone: timeZone}).toLocaleLowerCase();
}

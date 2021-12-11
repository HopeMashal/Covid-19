const ChartRegionArea=document.querySelector('.ChartRegionArea');
const ChartRegion =document.querySelector('.chart-region');
const InfoCountryArea=document.querySelector('.InfoCountryArea');
const InfoCountry=document.querySelector('.info-country');
const statButtons=document.querySelector('.stat-button');
const statButton=document.querySelectorAll('.stat-btn');
const regionButtons=document.querySelectorAll('.region-btn');
const CountriesOfRegion=document.querySelector('.countriesOfregion');
const titlecountry=document.querySelector('.title-country');
const totalcases=document.querySelector('.totat-cases');
const newcases=document.querySelector('.new-cases');
const totaldeaths=document.querySelector('.totat-deaths');
const newdeaths=document.querySelector('.new-deaths');
const totalrecovered=document.querySelector('.totat-recovered');
const criticalcondition=document.querySelector('.critical-condition');

const countries = {};
const regions = {};
const world = [];

let CountriesWorld = {};
let currntStat = 'confirmed';
let currentRegion='';

async function fetchCountries() {//Fetch All countries of the world (Name,Region)
    const response = await fetch('https://api.allorigins.win/raw?url=https://restcountries.herokuapp.com/api/v1');
    const data = await response.json();
    data.forEach(e => countries[e.cca2] = { name: e.name.common, region: e.region});
    await fetchWorldRegion();
}

async function fetchWorldRegion() {//Sorting all countries of the world by region, adding them to the world, and adding general statistics for countries 
    const responseWorldStat = await fetch(`https://corona-api.com/countries`);
    const regionData = await responseWorldStat.json();
    regionData.data.forEach(e => {
        if (regions[countries[e.code].region]) {//If the region is found in Regions, add the country to the region
            regions[countries[e.code].region].push(e.code);
            world.push({//adding countries(Name,Id,Region,Confirmed Stat) to the world
                name: e.name, id: e.code, region: countries[e.code].region,confirmed: e.latest_data.confirmed,
            });
        } else {//If the region isn't found in Regions, create new array for the region, add the country to the region
            regions[countries[e.code].region] = [];
            regions[countries[e.code].region].push(e.code);
            world.push({
                name: e.name, id: e.code, region: countries[e.code].region,confirmed: e.latest_data.confirmed,
            });
        }
        if (countries[e.code]) {//adding general statistics for countries
            countries[e.code].generalStat = {confirmed: e.latest_data.confirmed,deaths: e.latest_data.deaths,recovered: e.latest_data.recovered,critical: e.latest_data.critical}
        }
    })
}

function getRegionCounrties(region) {//Return All Countries Names of Region
    if (region === 'World') return CountriesWorld.world.map(e => countries[e].name);
    else return regions[region].map(e => countries[e].name);
}

function getRegionStat(region, stat) {//Return All Countries (Country Stat=>Number) of Region
    if (region === 'World') return CountriesWorld.world.map(e => countries[e].generalStat[stat])
    else return regions[region].map(e => countries[e].generalStat[stat])
}

function ChartRegionStat() {//Region Chart Form
    chart = new Chart(ChartRegion, {
        type: 'line',
        data: {
            labels: [''],
            datasets: [{
                label: '',
                backgroundColor: '#ccffff',
                borderColor: '#00e6e6',
                data: [''],
            }]
        },
        options: {
            responsive: false,
        }
    });
}

function setButtons() {//Setting The Region Buttons(setting the region)
    regionButtons.forEach(e => {
        e.addEventListener('click', () => {
            InfoCountry.style.display = 'none'; //The country information is hidden
            chart.config.data.labels = getRegionCounrties(e.textContent);//Get The countries Names of region
            chart.config.data.datasets[0].data = getRegionStat(e.textContent, currntStat);//Get the countries (Country Stat=>Number) of region
            chart.config.data.datasets[0].label = `Number of ${currntStat} in ${e.textContent}`;//Edit The chart label
            chart.update();//Update the chart information
            if (statButtons.style.display === '' || statButtons.style.display === 'none') {//The statistics buttons are hidden
                statButtons.style.display='block';
                ChartRegion.style.display='block';
            }
            currentRegion = e.textContent;//Update the current region
            CountriesOfRegion.innerHTML = `<h1 class="title-countries">The countries of ${e.textContent}:</h1>`;//Title Countries of region (buttons)
            setCountriesOfRegion(e.textContent);//Setting the countries of region(buttons)
        })
    })
}

function setStatButton() {//Setting The Statistics Buttons(setting the region stat)
    statButton.forEach(e => {
        e.addEventListener('click', () => {
            chart.config.data.datasets[0].data = getRegionStat(currentRegion, e.textContent.toLowerCase());//Get the countries stats for the region
            chart.config.data.datasets[0].label = `Number of ${e.textContent.toLowerCase()} in ${currentRegion}`;//Edit the chart label
            chart.update();
            currntStat = e.textContent.toLowerCase();//Update the current stat
        })
    })
}

function theTopCountries() {//Get The top countries(show in world region)
    world.sort((a, b) => b.confirmed - a.confirmed).forEach(e => {//sorting the top countries
        if(!CountriesWorld.world) CountriesWorld.world = [];
        if (CountriesWorld.world.length < 25) {//get the top 25 countries
            CountriesWorld.world.push(e.id);
        }
    });
}

function setCountriesOfRegion(region) {//Setting the countries of region (buttons)
    (region === 'World' ? world : regions[region]).forEach(e => {
        const button = document.createElement('button');
        button.textContent = countries[(region === 'World' ? e.id : e)].name;//Get the button value(text) is equal the country name
        CountriesOfRegion.style.display="block";
        CountriesOfRegion.appendChild(button);
        button.addEventListener('click', () => {
            statButtons.style.display='none';
            ChartRegion.style.display='none';
            getInfoCountryArea((region === 'World' ? e.id : e));//Get country information
        })
    })
}

async function getInfoCountryArea(CountryID) {//Get country information
    const response = await fetch(`https://corona-api.com/countries/${CountryID}`);
    const data = await response.json();
    InfoCountryArea.style.display='flex';
    InfoCountry.style.display='flex';
    titlecountry.innerText=`Statistics of ${countries[CountryID].name} `;
    totalcases.innerText=`${data.data.latest_data.confirmed}`;
    newcases.innerText=`${data.data.today.confirmed}`;
    totaldeaths.innerText=`${data.data.latest_data.deaths}`;
    newdeaths.innerText=`${data.data.today.deaths}`;
    totalrecovered.innerText=`${data.data.latest_data.recovered}`;
    criticalcondition.innerText=`${data.data.latest_data.critical}`;
}

async function SetThePage() {//Setting the page(fetch countries,chart form,top countries,set stat and region buttons)
    await fetchCountries();
    await ChartRegionStat();
    theTopCountries();
    setButtons();
    setStatButton();
}
SetThePage();
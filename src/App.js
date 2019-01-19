import React, { Component } from 'react';
import windIcon from './img/wind.png';
import sunImg from './img/sun.png';
import loadingImg from './img/loading.gif';
import './App.css';
import './css/weather-icons.min.css';
import './fontawesome/css/all.min.css';


var mainObject = {
  city: "...",
  country: "...",
  riseTime: "0:00 AM",
  setTime: "0:00 PM",
  tempToday: 0,
  currentState: "Haze",
  currentStateIcon: "02d",
  todayState: "Clear",
  todayMin: 0,
  todayMax: 0,
  todayStateIcon: "03n",
  tomorrowState: "Sunny",
  tomorrowMin: 0,
  tomorrowMax: 0,
  tomorrowStateIcon: "09d",
  pressure: 0,
  humidity: 0,
  rainfall: 0,
  snow: 0,
  visibility: 0,
  clouds: 0,
  windSpeed: 0,
  forecast: {
    time:".......",
    days:[{day:"...",date:"....."},{day:"...",date:"....."},{day:"..",date:"....."},{day:"...",date:"....."},{day:"...",date:"....."}],
    weather:[{humidity: 0,windSpeed: 0,temperature: 0,cloud: 0},{humidity: 0,windSpeed: 0,temperature: 0,cloud: 0},{humidity: 0,windSpeed: 0,temperature: 0,cloud: 0},{humidity: 0,windSpeed: 0,temperature: 0,cloud: 0},{humidity: 0,windSpeed: 0,temperature: 0,cloud: 0}],
    maxs:[0,0,0,0,0],
    mins:[0,0,0,0,0]
  },
  searchCity: false,
  searching: false,
  openedSettings: false,
}

function timeFormating(time){
  time = new Date(time);
  var tHour = time.getHours();
  var tMin = time.getMinutes();
  var tType;
  if(tHour > 12){
    tType = "PM";
    tHour = tHour - 12;
  }
  else {
    tType = "AM";
  }
  return tHour + ":" + ((tMin < 10) ? "0" : "") + tMin + " " + tType;
}

function formatNum(x){
  return (x >= 10) ? x : "0"+x;
}

function updateMainInfo(w){
  let m = {};
  m.currentState = w.weather[0].main;
  m.currentStateIcon = w.weather[0].icon;
  m.tempToday = Math.round(w.main.temp)-273;
  m.pressure = w.main.pressure;
  m.humidity = w.main.humidity;
  m.todayState = w.weather[0].main;
  m.todayStateIcon = w.weather[0].icon;
  m.visibility = isNaN((w.visibility/1000).toFixed(2)) ? "...." : (w.visibility/1000).toFixed(2);
  m.windSpeed = w.wind.speed;
  m.clouds = w.clouds.all;
  m.rainfall = (w.rain) ? w.rain["3h"] : "0.0";
  m.snow = (w.snow) ? w.snow["3h"] : "0.0";

  return m;
}

function updateForecastInfo(w){
  let m = {};
  m.weather = [];
  m.days = [];
  for(let n = 0; n < 5; n++){
    m.weather.push({humidity:w.list[n*8].main.humidity,windSpeed:w.list[n*8].wind.speed,cloud:w.list[n*8].clouds.all});
    let d = new Date(w.list[n*8].dt*1000);
    m.days.push({day:(n === 0) ? "Today" : ui.days[d.getDay()],date:(formatNum(d.getDate()).toString()+"/"+formatNum(d.getMonth()).toString())});
  }
  m.time = timeFormating(w.list[0].dt*1000);

  let maxs = [-1000];
  let mins = [1000];

  for(let n = 0; n <= w.list.length%8; n++){
    if(w.list[n].main.temp_min < mins[0]) mins[0] = w.list[n].main.temp_min;
    if(w.list[n].main.temp_max > maxs[0]) maxs[0] = w.list[n].main.temp_max;
  //	alert(w.list[n].main.temp_min);
  }

  for(let n = w.list.length%8; n < w.list.length; n+=8){
    let tmp_min = 1000, tmp_max = -1000;
    for(let i = 0; i < 8; i++){
      if(w.list[n+i].main.temp_min < tmp_min) tmp_min = w.list[n+i].main.temp_min;
      if(w.list[n+i].main.temp_max > tmp_max) tmp_max = w.list[n+i].main.temp_max;
    }
    mins.push(tmp_min);
    maxs.push(tmp_max);
  }

  maxs.map((value,n)=>maxs[n]=(value-273).toFixed(2));
  mins.map((value,n)=>mins[n]=(value-273).toFixed(2));

  m.maxs = maxs;
  m.mins = mins;
  return m;
}


var ui = {};
ui.w = window.innerWidth;
ui.h = window.innerHeight;
ui.appW = ((ui.w >= 400) ? 400 : ui.w);
ui.appL = (ui.w - ui.appW)/2;
ui.sunCanW = ui.appW - 20;
ui.sunCanH = ui.appW/2;
ui.sunInfoTop = ui.appW - 80;
ui.sunImg = new Image();
ui.sunImg.src = sunImg;
ui.days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

ui.stateIcons = {
  "01d" : "wi-day-sunny",
  "01n" : "wi-night-clear",
  "02d" : "wi-day-cloudy",
  "02n" : "wi-night-alt-cloudy",
  "03d" : "wi-cloud",
  "03n" : "wi-cloud",
  "04d" : "wi-cloudy",
  "04n" : "wi-cloudy",
  "09d" : "wi-rain",
  "09n" : "wi-rain",
  "10d" : "wi-day-rain",
  "10n" : "wi-night-alt-rain",
  "11d" : "wi-day-lightning",
  "11n" : "wi-night-lightning",
  "13d" : "wi-day-snow",
  "13n" : "wi-night-alt-snow",
  "50d" : "wi-dust",
  "50n" : "wi-dust"
}

class Location extends Component {
  render(){
    let search = [];
    if(!this.props.searchCity && !this.props.settings){
      search.push(
        <div key="button">
          <button onClick={this.props.searchButtonHandler} className="searchButton"><i className="fa fa-search"></i></button>
          <button onClick={this.props.openSettingsHandler} className="settingsButton"><i className="fa fa-sliders-h"></i></button>
        </div>
      );
    }
    else if(this.props.searchCity){
      search.push(
        <div key="search" className="searchCity">
          <div id="searchInp">
            <input type="text" id="searcField" placeholder="Search for a city" onInput={this.props.searchInputHandler} />
            <button className="searchIcon"><i className="fa fa-search"></i></button>
            {(this.props.searching) ? <img src={loadingImg} alt='' height="20" width="20" id="loadIcon" /> : <i id="cancelIcon" className="fa fa-window-close" onClick={this.props.searchCancelHandler}></i>}
          </div>
          <ul id="cityMatches"></ul>
        </div>
      );
    }
    else if(this.props.settings){
      search.push(
        <div className="settings" key="settings" style={{width:ui.appW,height:ui.h}}>
          Settings Page
        </div>
      );
    }

    return (
      <div className="location" style={{width:ui.appW}}>
        <i className="fa fa-map-marker-alt"></i>
        <span> {this.props.city}, {this.props.country}</span>
        {search}
      </div>
    );
  }
}

class Sun extends Component{
  render(){
    return (
      <div className={this.props.identity}>
        <span className="sunTime">{this.props.time}</span><br/>
        <span>Sun{this.props.state}</span>
      </div>
    );
  }
  }

  class Temp extends Component{
  render(){
    return (
      <div className="mainTemp">
        <i className={"wi "+this.props.icon} style={{fontSize:55,display:"inline-block",paddingBottom:10}}></i><br/>
        <span className="temp">{this.props.temperature}°C</span><br/>
        <span>{this.props.state}</span>
      </div>
    );
  }
}

class Weather extends Component{
  render(){
    return (
      <div className={this.props.identity}>
        {this.props.day}<br/>
        <i className={"wi "+this.props.icon}></i><br/>
        <span style={{fontSize:20}}>{this.props.state}</span><br/>
        <span style={{fontSize:14}}>{this.props.min}~{this.props.max}°</span>
      </div>
    );
  }
}

class InfoCell extends Component {
  render(){
    return (
      <div>
        <i className={this.props.icon}></i>
        <p>
          <span>{this.props.value}</span><br/>
          {this.props.property}
        </p>
      </div>
    );
  }
}

class InfoTable extends Component {
  render(){
    return (
      <table className="InfoTable" cellSpacing="0">
        <tbody>
          <tr>
            <td><InfoCell icon="fa fa-tachometer-alt" value={this.props.pressure} property="Pressure" /></td>
            <td><InfoCell icon="fa fa-leaf" value={this.props.humidity} property="Humidity" /></td>
          </tr>
          <tr>
            <td><InfoCell icon="wi wi-rain" value={this.props.rainfall} property="Rainfall" /></td>
            <td><InfoCell icon="wi wi-snowflake-cold" value={this.props.snow} property="Snow" /></td>
          </tr>
          <tr>
            <td><InfoCell icon="fa fa-eye" value={this.props.visibility} property="Visibility" /></td>
            <td><InfoCell icon="fa fa-cloud" value={this.props.clouds} property="Clouds" /></td>
          </tr>
        </tbody>
      </table>
    );
  }
}

class ForecastCell extends Component {
  render(){
    return (
      <td>
        {(this.props.icon) ? (<i style={{fontSize:16}} className={this.props.icon}></i>) : (<img src={windIcon} alt='' height="22" width="18" />)}<br/>{this.props.value}<span style={{fontSize:11}}>{this.props.unit}</span>
      </td>
    );
  }
}

class ForecastRow extends Component {
  render(){
    let cells = [];

    this.props.weather.map((index,i)=>cells.push(<ForecastCell value={index[this.props.type]} unit={this.props.unit} icon={this.props.icon} key={i} />));

    return (
      <tr>{cells}</tr>
    );
  }
}

class ForecastTable extends Component {
  render(){
    let cells = [];
    this.props.days.map((index,i)=>cells.push(<td key={i}>{index.day}<br/>{index.date}<br/>{this.props.time}</td>));
    let toolTips = [];
    for(let n = 0; n < 10; n++){
      toolTips.push(<div className="tooltip" key={n}>0°C</div>);
    }

    return (
      <table className="ForecastTable" cellPadding="10" cellSpacing="0">
        <caption>5 Days Forecast</caption>
        <tbody>
          <tr>{cells}</tr>
          <tr>
            <td colSpan="5" style={{height:120,position:"relative"}}>
              <canvas id="tempGraph"></canvas>
              {toolTips}
            </td>
          </tr>
          <ForecastRow weather={this.props.weathers} type="humidity" unit="%" icon="fa fa-leaf" />
          <ForecastRow weather={this.props.weathers} type="windSpeed" unit="km/h" icon="" />
          <ForecastRow weather={this.props.weathers} type="cloud" unit="%" icon="wi wi-cloudy" />
        </tbody>
      </table>
    );
  }
}


var sunCanvas;
var sunCtx;
var graphCanvas;
var graphCtx;
var tooltips;
var lxhttp;

class SuggestGithub extends Component {
  constructor(props){
    super(props);
    this.state = {
      visibility : 'block',
      leftTransform : (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) ? 0 : 8
    }
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel(){
    this.setState({visibility:'none'});
  }

  render (){
    return (
      <div className='suggestDiv' style={{display:this.state.visibility,left:this.state.leftTransform}}>
        <div className='suggestContent' style={{width:ui.appW}}>
          <div className='suggestTextCnt'>
            <span>View source code or contribute to this project on <a href='https://github.com/Adnan-Toky/weather-app' target="_blank" rel="noopener noreferrer">GitHub</a></span>
          </div>
          <div className='suggestBtnCnt'>
            <button className='btnCancel' onClick={this.handleCancel}>No, Thanks</button>
            <a href='https://github.com/Adnan-Toky/weather-app' target="_blank" rel="noopener noreferrer"><button className='btnProceed' onClick={this.handleCancel}>Visit Now</button></a>
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = mainObject;
    this.searchButtonHandler = this.searchButtonHandler.bind(this);
    this.searchCancelHandler = this.searchCancelHandler.bind(this);
    this.searchInputHandler = this.searchInputHandler.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.updateWeatherData = this.updateWeatherData.bind(this);
  }

  drawSun(ctx,w,h,sun,x){
    let r = w*0.75/2;
    let sw = 45;
    let sh = 45;

    ctx.clearRect(0,0,w,h);

    ctx.setLineDash([8,6]);

    ctx.beginPath();
    ctx.arc(w/2,h,r,Math.PI,0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(w/2,h,r,Math.PI,Math.PI+x*Math.PI/180);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "orange";
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(sun,w/2-r*Math.cos(x*Math.PI/180)-sw/2,h-r*Math.sin(x*Math.PI/180)-sh/2,sw,sh);
  }

  drawGraph(maxs,mins,ctx,w,h){
    ctx.clearRect(0,0,w,h);
    var max = Math.max.apply(null,maxs);
    var min = Math.min.apply(null,mins);
    var unitY = h/2/(max-min);
    var unitX = w/5;

    var pointSet1 = [];
    var pointSet2 = [];

    for(let n = 0; n < 5; n++){
      pointSet1.push(unitX/2+unitX*n);
      pointSet1.push(40+(max-maxs[n])*unitY);
      pointSet2.push(unitX/2+unitX*n);
      pointSet2.push(40+(max-mins[n])*unitY);
    }

    ctx.beginPath();
    ctx.moveTo(pointSet1[0],pointSet1[1]);
    for(let n = 2; n < 10; n+=2){
      ctx.lineTo(pointSet1[n],pointSet1[n+1],5,0,Math.PI*2);
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(pointSet2[0],pointSet2[1]);
    for(var n = 2; n < 10; n+=2){
      ctx.lineTo(pointSet2[n],pointSet2[n+1],5,0,Math.PI*2);
    }
    ctx.strokeStyle = "#fa0";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    for(let n = 0; n < 10; n+=2){
      ctx.beginPath();
      ctx.arc(pointSet1[n],pointSet1[n+1],3,0,Math.PI*2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(pointSet2[n],pointSet2[n+1],3,0,Math.PI*2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.closePath();
      tooltips[n].style.left = (pointSet1[n]-20)+"px";
      tooltips[n].style.top = (pointSet1[n+1]-10)+"px";
      tooltips[n].textContent = maxs[Math.floor(n/2)]+"°C";

      tooltips[n+1].style.left = (pointSet2[n]-20)+"px";
      tooltips[n+1].style.top = (15+pointSet2[n+1])+"px";
      tooltips[n+1].textContent = mins[Math.floor(n/2)]+"°C";

    }

  }

  componentDidMount(){
    sunCanvas = document.getElementById("sunCanvas");
    sunCanvas.width = ui.sunCanW;
    sunCanvas.height = ui.sunCanH;

    sunCtx = sunCanvas.getContext("2d");
    setTimeout(()=>this.drawSun(sunCtx,ui.sunCanW,ui.sunCanH,ui.sunImg,-80),100);

    tooltips = document.getElementsByClassName("tooltip");
    graphCanvas = document.getElementById("tempGraph");
    graphCanvas.width = ui.appW;
    graphCanvas.height = 120;

    graphCtx = graphCanvas.getContext("2d");

    this.drawGraph(this.state.forecast.maxs,this.state.forecast.mins,graphCtx,ui.appW,120);
  }

  searchButtonHandler(){
    this.setState({searchCity:true});
  }

  searchCancelHandler(){
    this.setState({searchCity:false});
  }

  searchInputHandler(e){
    let q = e.target.value;
    let State = this;
    if(q.length){
      this.setState({searching:true});


      let txt = "";

      if(lxhttp) lxhttp.abort();
      lxhttp = new XMLHttpRequest();
      lxhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          State.setState({searching:false});
          var locations = JSON.parse(this.responseText);
          if(locations.resourceSets[0].estimatedTotal > 0){
            for(var n = 0; n < locations.resourceSets[0].estimatedTotal;n++){
              var formCityName = "";
              if(!locations.resourceSets[0].resources[n].address.adminDistrict){
                formCityName = locations.resourceSets[0].resources[n].name;
              }
              else if(!locations.resourceSets[0].resources[n].address.adminDistrict2){
                formCityName =  locations.resourceSets[0].resources[n].name.split(",")[0]+", "+
                  locations.resourceSets[0].resources[n].address.adminDistrict+", "+
                  locations.resourceSets[0].resources[n].address.countryRegion;
              }
              else {
                formCityName =  locations.resourceSets[0].resources[n].name.split(",")[0]+", "+
                locations.resourceSets[0].resources[n].address.adminDistrict2+", "+
                locations.resourceSets[0].resources[n].address.countryRegion;
              }
              txt += "<li class='cityListItem'>"+formCityName+"</li>";
            }
          }
          else {
            txt += "<li>No city found</li>";
          }
          document.getElementById("cityMatches").innerHTML = txt;

          var cityListItems = document.getElementsByClassName("cityListItem");
          for(let n = 0; n < cityListItems.length; n++){
            cityListItems[n].points = locations.resourceSets[0].resources[n].point.coordinates;
            cityListItems[n].location = locations.resourceSets[0].resources[n].name;
            function selectCity(e){
              /*
              loadDoc(e.target.points[0],e.target.points[1],e.target.location);
              loadDocDetails(e.target.points[0],e.target.points[1]);
              */
              State.updateWeatherData(e.target.points[0],e.target.points[1],e.target.location);
              State.setState({searchCity:false});
            }
            cityListItems[n].addEventListener("click",selectCity);
          }
          txt = "";
        }
        else {
          if(this.readyState === 4){
          //	alert(this.responseText);
          }
        }
      }
      lxhttp.open("GET", "https://dev.virtualearth.net/REST/v1/Locations?q="+q+"&maxResults=20&key=AtYQBO45F9ORGtHUJHDdZBmKHCEJoS6CsQFTJM3hb7fjRhI9BvPJHcIXkb1-MiWI", true);
      lxhttp.send();
    }
    else{
      this.setState({searching:false});
    }
  }

  openSettings(){
    //this.setState({openedSettings:true});
    alert('Not implemented...');
  }

  updateWeatherData(lat,lon,loc){
    let State = this;
    fetch("https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&APPID=15d7d2d0d4a489e05feb0ee6cf59b7bb")
      .then(res=>res.json()).then(
        result=>{
          this.setState({city:loc.split(",")[0] || result.name,country:loc.split(",")[1] || result.sys.country});
          this.setState(updateMainInfo(result));
          fetch("https://api.timezonedb.com/v2/get-time-zone?key=ARWGDZXY8NXV&format=json&by=position&lat="+lat+"&lng="+lon)
            .then(obj=>obj.json()).then(
              timeObj=>{
                let timeOffset = timeObj.gmtOffset + new Date().getTimezoneOffset()*60;
                let currentTime = timeObj.timestamp - timeObj.gmtOffset;
                this.setState({riseTime:timeFormating((result.sys.sunrise+timeOffset)*1000),setTime:timeFormating((result.sys.sunset+timeOffset)*1000)});
                let sunPosCounterMax = (currentTime-result.sys.sunrise)*180/(result.sys.sunset-result.sys.sunrise);
                let sunPos = -10;
                let intv = setInterval(function(){
                  if(sunPosCounterMax > 0 && sunPos < sunPosCounterMax){
                    State.drawSun(sunCtx,ui.sunCanW,ui.sunCanH,ui.sunImg,sunPos);
                    sunPos++;
                  }
                  else {
                    State.drawSun(sunCtx,ui.sunCanW,ui.sunCanH,ui.sunImg,sunPos);
                    clearInterval(intv);
                  }
                },10)
              }
            )
        },
        error=>{
          alert(error)
        }
      )

      fetch("https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&APPID=15d7d2d0d4a489e05feb0ee6cf59b7bb")
        .then(res=>res.json()).then(
          result=>{
            let weather = {...this.state.forecast};
            let updated = updateForecastInfo(result);
            weather.weather = updated.weather;
            weather.days = updated.days;
            weather.time = updated.time;
            weather.mins = updated.mins;
            weather.maxs = updated.maxs;
            this.setState({forecast:weather});
            this.drawGraph(this.state.forecast.maxs,this.state.forecast.mins,graphCtx,ui.appW,120);
            this.setState({
              todayMin:updated.mins[0],
              todayMax:updated.maxs[0],
              tomorrowMin:updated.mins[1],
              tomorrowMax:updated.maxs[1],
              tomorrowState:result.list[8].weather[0].main,
              tomorrowStateIcon:result.list[8].weather[0].icon
            });
          }
        );
  }

  render(){
    return (
      <div className="app" style={{width:ui.appW,left:ui.appL}}>
        <Location city={this.state.city} country={this.state.country} searchCity={this.state.searchCity} searchButtonHandler={this.searchButtonHandler} searchCancelHandler={this.searchCancelHandler} searchInputHandler={this.searchInputHandler} searching={this.state.searching} openSettingsHandler={this.openSettings} settings={this.state.openedSettings} />
        <canvas id="sunCanvas" style={{top:(280 - ui.sunCanH),left:(ui.appW-ui.sunCanW)/2}}></canvas>
        <Sun state="rise" identity="sun" time={this.state.riseTime} />
        <Sun state="set" identity="sun2" time={this.state.setTime} />
        <Temp temperature={this.state.tempToday} state={this.state.currentState} icon={ui.stateIcons[this.state.currentStateIcon]}/>
        <Weather identity="weather1" day="Today" icon={ui.stateIcons[this.state.todayStateIcon]} state={this.state.todayState} min={this.state.todayMin} max={this.state.todayMax} />
        <Weather identity="weather2" day="Tomorrow" icon={ui.stateIcons[this.state.tomorrowStateIcon]} state={this.state.tomorrowState} min={this.state.tomorrowMin} max={this.state.tomorrowMax} />
        <InfoTable pressure={this.state.pressure} humidity={this.state.humidity+"%"} rainfall={this.state.rainfall+" mm"} snow={this.state.snow+" mm"} visibility={this.state.visibility+" km"} clouds={this.state.clouds+"%"} />
        <ForecastTable days={this.state.forecast.days} weathers={this.state.forecast.weather} time={this.state.forecast.time} />
        <SuggestGithub/>
      </div>
    );
  }
}

export default App;

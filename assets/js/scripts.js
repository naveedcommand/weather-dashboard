var apiKey = "bb5c595c6a3a88439dd49bc9a022611b";
var iconURL = "https://openweathermap.org/img/w/{0}.png"; 

$(document).ready(function(){	
	
	displayHistoryCities(getAllCitiesFromLocalStorage());
	
	$("#btnSearchBox").on('click', function(){
		
		if($("#txtSearch").val().trim() == "")
		{
			alert('Please enter city name');
			return;
		}
		
		var cities = getAllCitiesFromLocalStorage();
		
		var isValidCity = displayDataByCityName($("#txtSearch").val());
		
		if(isValidCity)
		{
			if(isCityAlreadyExist(cities) == false)
			{
				  var city = {};
				
				  city.name = $("#txtSearch").val();
				  city.id = cities.length + 1;			  
				  
				  cities.push(city);			  
				  localStorage.setItem("City", JSON.stringify(cities));
			}
		}
		
		displayHistoryCities(cities);

		$("#txtSearch").val('');
	});
});

	function getAllCitiesFromLocalStorage(){
		return JSON.parse(localStorage.getItem('City')) || [];
	}

	function isCityAlreadyExist(cities){
		
		  var isCityExist = false;
		  var i = cities.length;
		
		  while(i--){
			  if(cities[i] != null){
				  if(cities[i].name.toUpperCase().trim() == $("#txtSearch").val().toUpperCase().trim())
				  {
					  return true; 
				  }
			  }
		  }
		  
		  return false;
	}
	
	function getCityNameById(id){
		
		  var cities = getAllCitiesFromLocalStorage();
		
		  isCityExist = false;
		  var i = cities.length;
		
		  while(i--){
			  if(cities[i] != null){
				  if(cities[i].id == id)
				  {
					  return cities[i].name; 
				  }
			  }
		  }
		  
		  return "";
	}

	function displayHistoryCities(cities){
		
		  var i = cities.length;
		  var cityHtml = "";
		
		  while(i--){
			  if(cities[i] != null){
				  cityHtml +=	"<a href='#' class='btn btn-block gray_btn' onclick=displayDataByCityId('" + cities[i].id + "'); >" + cities[i].name + "</a>";						
			  }
		  }	
		  
		  document.getElementById("cityHistory").innerHTML = cityHtml;
		
	}
	
	function displayDataByCityId(id){
		
		
		var cityName = getCityNameById(id);
		
		displayDataByCityName(cityName);
		
	}

	function displayDataByCityName(city)
	{
		
		var apiCityData = "https://api.openweathermap.org/data/2.5/weather?q={0}&appid={1}&units=imperial";
		
		apiCityData = apiCityData.replace("{0}", city);
		apiCityData = apiCityData.replace("{1}", apiKey);	
		
		var weatherData = getDataByApi(apiCityData);
		
		if(weatherData != null){		
		
			displayBasicData(weatherData);	
			
			document.getElementById("forecast").innerHTML = "";
			
			var apiForecast = "https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={apiKey}&units=imperial";		
					
			apiForecast = apiForecast.replace("{lat}", $("#lat").val());				
			apiForecast = apiForecast.replace("{lon}", $("#lon").val());				
			apiForecast = apiForecast.replace("{apiKey}", apiKey);
			
			var forecastData = getDataByApi(apiForecast);
		
			if(forecastData != null)
			{
				displayUVData(forecastData);				
				
				var dataList = forecastData.daily;
				
				for(var index = 1; index < dataList.length-2;index++){
					
					var data = dataList[index];
					
					displayForecast(data);
				};
				
				return true;
			}
			else{
				alert("Record not found for city: " +  city);
				return false;
			}	
		}
		else{
			alert("Record not found for city: " +  city);
			return false;
		}
	}
	
	function displayForecast(data){
		
		var forecastHTML = "<li><div class='owl-item dark_blue_box' >" + 
										" <label>{date}</label> " + 
										" <img class='mb-1' src='{icon}' alt=''> " + 
										" <p>Temp: {temp}&deg;F</p> " + 
										" <p>Wind: {wind} MPH</p> " + 
										" <p>Humidity: {humidity}%</p> " + 
										" </div></li>	" ;
										
		forecastHTML = forecastHTML.replace("{date}", moment.unix(data.dt).format("MM/DD/YYYY"));		
		
		forecastHTML = forecastHTML.replace("{icon}", iconURL.replace("{0}",data.weather[0].icon));		
		
		forecastHTML = forecastHTML.replace("{temp}", data.temp.day);		
		
		forecastHTML = forecastHTML.replace("{wind}", data.wind_speed);
		
		forecastHTML = forecastHTML.replace("{humidity}", data.humidity);								
		
		document.getElementById("forecast").innerHTML += forecastHTML;
					
	}
	
	

	function displayUVData(UVData)
	{
		var uiv = UVData.current.uvi;
		var uivID = $("#uvIndex");
		
		uivID.html(UVData.current.uvi);
		
		uivID.removeClass("bgcolor-green");	
		uivID.removeClass("bgcolor-yellow");	
		uivID.removeClass("bgcolor-orange");	
		uivID.removeClass("bgcolor-red");	
		uivID.removeClass("bgcolor-light-maroon");	
		
		if(uiv < 3)
		{
			uivID.addClass("bgcolor-green");	
		}
		else if(uiv >= 3 && uiv < 6)
		{
			uivID.addClass("bgcolor-yellow");	
		}
		else if(uiv >= 6 && uiv < 8)
		{
			uivID.addClass("bgcolor-orange");	
		}
		else if(uiv >= 8 && uiv <= 10)
		{
			uivID.addClass("bgcolor-red");	
		}
		else{
			uivID.addClass("bgcolor-light-maroon");	
		}
		
	}

	function displayBasicData(response)
	{
		var iconHtml = "<img src='" + iconURL.replace("{0}",response.weather[0].icon) + "'>";
				
		$("#cityAndDate").html(response.name + " (" + moment.unix(response.dt).format("MM/DD/YYYY") + ")&nbsp;" + iconHtml);	
		
		$("#time").html( moment.utc(response.dt * 1000 + response.timezone * 1000).format("dddd hh:mm A"));				
		
		$("#temperature").html(response.main.temp);
		$("#wind").html(response.wind.speed);
		$("#humidity").html(response.main.humidity);				
		
		$("#lon").val(response.coord.lon);
		$("#lat").val(response.coord.lat);
	}

   function getDataByApi(apiCityData){
	   
	   var weatherData = null;
	   
	   $.ajax({
			url: apiCityData,
			async: false,
			cache: false,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			contentType : "application/json",
			type : "Get",
			dataType : "JSON",
			success: function(response){
				weatherData = response;
				// debugger;			
				
			},
			
			failure: function(error){
				alert(error);
			}
			
		});
		
		return weatherData;
		
   }	 
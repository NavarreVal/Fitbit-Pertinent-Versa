import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { units } from "user-settings";
import { today } from "user-activity";
import * as hrm from "../common/hrm";
import { battery } from "power";
import * as util from "../common/utils";
import { 
  getDisplayMonth, 
  getDisplayDay, 
  zeroPad, 
} from "../common/utils";

// Import the messaging module
import * as messaging from "messaging";
import document from "document";

// Import clock preference (12h or 24h format)
const clockPref = preferences.clockDisplay;

// Import measure units 
const measureUnitsPref = units.distance;

// Update the clock every minute
clock.granularity = "minutes";

const arc = document.getElementById("arc");

// Get a handle on the <text> element
const lblSteps = document.getElementById("steps");
const lblDate = document.getElementById("date");
const lblDay = document.getElementById("day");
const lblTime = document.getElementById("time");

const timeHandle = document.getElementById("timeLabel");
const temperatureHandle = document.getElementById("temperatureLabel");
const meteoHandle = document.getElementById("meteoLabel");
const locationHandle = document.getElementById("locationLabel");

hrm.initialize();

// Update the <text> element every tick with the current time
clock.ontick = e => {
  const current = e.date;
  const month = current.getMonth();
  const dayOfMonth = current.getDate();
  const day = current.getDay();
  const hours = current.getHours();
  const mins = zeroPad(current.getMinutes());
  
  const displayMonth = getDisplayMonth(month);
  const displayDay = getDisplayDay(day);
  
  const { clockDisplay } = preferences;
  const displayHours = clockDisplay === "12h" ? hours % 12 || 12 : zeroPad(hours);
  
  const charge = battery.chargeLevel;
  
  if (charge > 70) {
    arc.style.fill = "greenyellow";
  } else if (charge > 50) {
    arc.style.fill = "#FFA500";
  } else if (charge > 25) {
    arc.style.fill = "#FF6347";
  } else {
    arc.style.fill = "red";
  }
  
  arc.sweepAngle = (1.8 * charge);
  
  lblSteps.text = today.local.steps;
  lblDate.text = `${dayOfMonth} ${displayMonth}`;
  lblDay.text = `${displayDay}`;
  lblTime.text = `${displayHours}:${mins}`;
  
  // Request weather data from the companion
function fetchWeather() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: 'weather'
    });
  }
}

// Display the weather data received from the companion
function processWeatherData(data) {
  if (measureUnitsPref === "us ") {
    temperatureHandle.text = ((~~data.temperature * 9 / 5) +32) + " °F";
  }
  else {
    temperatureHandle.text = ~~data.temperature + " °C";
  }
  temperatureHandle.text = ~~data.temperature + " °F";
  meteoHandle.text = data.meteo;
  locationHandle.text = data.location;
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Fetch weather when the connection opens
  fetchWeather();
}

// Listen for messages from the companion
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    processWeatherData(evt.data);
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

setInterval(fetchWeather, 60 * 1000 * 60); //update weather every hour (60 minutes per hour * 1000 millisecs * 60 seconds per hour)
  
}

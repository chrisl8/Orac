/* eslint-disable no-case-declarations,no-fallthrough,no-await-in-loop */
import WebSocket from 'ws';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import getHomeAssistantConfig from './getHomeAssistantConfig.js';
import webserver from './webserver.js';
import wait from './wait.js';
import pushMe from './pushMe.js';
import isToday from './dateIsToday.js';
import RobotWebServerData from './robotWebServerData.js';
import makeRandomNumber from './makeRandomNumber.js';
import persistentData from './persistentKeyValuePairs.js';
import HttpRequest from './httpRequest.js';
import spawnProcess from './spawnProcess.js';
import speak from './speak.js';
import { trackedStatusObject } from './trackedStatusDataModel.js';
import RobotSocketServerSubscriber from './RobotSocketServerSubscriber.js';
import playWav from './playWav.js';
import messageHandler from './messageHandler.js';

const robotSocketServerSubscriber = new RobotSocketServerSubscriber(
  messageHandler,
);
robotSocketServerSubscriber.start();

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

// Dalek One interaction Data
const robotWebserverData = await RobotWebServerData();
const dalekOneConnectInfo = robotWebserverData.find(
  (entry) => entry.name === 'DalekOne',
);

// TODO: Garage doors should have different sound.
// TODO: Front door should have special sound.
// TODO: Windows a different sound too?
const doorOpenClosedGenericResponse = async ({
  friendlyName,
  simplifiedName,
  state,
  isInitialData,
  doorType,
}) => {
  const previousState = await persistentData.get(simplifiedName);
  const previousAnnouncedState =
    previousState.value === '1' ? 'OPEN' : 'Closed';
  let announcedState = 'Unknown';
  let shortFileName;
  if (state.newState.hasOwnProperty('state') && state.newState.state === 'on') {
    // Open  State
    shortFileName = `DoorOpeningMinecraft`;
    persistentData.set(simplifiedName, true);
    announcedState = 'OPEN';
  } else {
    // Closed State
    shortFileName = `DoorClosingMinecraft`;
    persistentData.set(simplifiedName, false);
    announcedState = 'Closed';
  }
  if (!isInitialData && announcedState !== previousAnnouncedState) {
    if (shortFileName) {
      playWav({ shortFileName });
    }
    console.log(`${friendlyName} ${announcedState}`);
  }
};

const sentRequests = new Map();

// Use these for testing:
// Delete entries so that these fire off right away.
// await persistentData.del("watchBatteryChargedLastMessageSent");
// await persistentData.del("pleaseChargeWatchBatteryLastMessageSent");

const configObject = await getHomeAssistantConfig();

const ws = new WebSocket(
  `ws://${configObject.hostname}:${configObject.port}/api/websocket`,
);

function getStateFromEventOrState(eventData) {
  const state = {};
  if (eventData.hasOwnProperty('state')) {
    state.oldState = { ...eventData };
    state.newState = { ...eventData };
  }
  if (eventData.hasOwnProperty('old_state')) {
    state.oldState = { ...eventData.old_state };
  }
  if (eventData.hasOwnProperty('new_state')) {
    state.newState = { ...eventData.new_state };
  }
  return state;
}

async function handleEntriesWithEventData(eventData, isInitialData) {
  const state = getStateFromEventOrState(eventData);
  let testData;
  switch (eventData.entity_id) {
    case 'binary_sensor.basement':
      // Office Motion Sensor
      if (
        state.newState.hasOwnProperty('state') &&
        state.newState.state === 'on'
      ) {
        await persistentData.set('officeMotionDetected');
        console.log('Motion detected in Office.');
      }
      break;
    case 'sensor.christens_apple_watch_battery_state':
    case 'sensor.christens_apple_watch_battery_state_2':
      if (
        state.newState.hasOwnProperty('attributes') &&
        state.newState.attributes.hasOwnProperty('battery')
      ) {
        trackedStatusObject.watchBattery.level =
          state.newState.attributes.battery;
      } else {
        console.error('Unexpected Watch data:');
        console.error(state.newState);
      }
      if (
        state.newState.hasOwnProperty('attributes') &&
        state.newState.attributes.hasOwnProperty('battery_status')
      ) {
        trackedStatusObject.watchBattery.isCharging =
          state.newState.attributes.battery_status !== 'NotCharging';
      } else {
        console.error('Unexpected Watch data:');
        console.error(state.newState);
      }
      console.log(
        `Watch battery ${
          trackedStatusObject.watchBattery.isCharging ? 'is' : 'is not'
        } charging and battery is at ${
          trackedStatusObject.watchBattery.level
        }%.`,
      );

      // Notify about full battery!
      if (
        trackedStatusObject.watchBattery.isCharging &&
        trackedStatusObject.watchBattery.level === 100
      ) {
        // Always use a random delay, because it is easy to get the same message twice at the same time!
        await wait(makeRandomNumber.between(2, 10) * 1000);

        // First check when we last sent a message, so we don't send duplicates
        const watchBatteryChargedLastMessageSent = await persistentData.get(
          'watchBatteryChargedLastMessageSent',
        );
        const lastSentMinutesAgo =
          (new Date().getTime() -
            watchBatteryChargedLastMessageSent.timestamp) /
          1000 /
          60; // Minutes
        // Check timestamp
        if (lastSentMinutesAgo > 60) {
          // First update sent time in database
          await persistentData.set('watchBatteryChargedLastMessageSent');
          const message = 'Your watch is done charging.';
          console.log(message);
          pushMe(message);
        }
      }
      break;

    // GPS Location Trackers
    case 'device_tracker.christens_apple_watch':
    case 'device_tracker.christens_apple_watch_2':
    case 'device_tracker.cooper_s':
    case 'device_tracker.sonicscrewdriver':
    case 'device_tracker.sonicscrewdriver_2':
    case 'device_tracker.christens_ipad_2':
    case 'device_tracker.christens_ipad_3':
    case 'device_tracker.sm_n986u1':
    case 'device_tracker.amazon_kindle_fire':
    case 'device_tracker.christens_ipad':
    case 'device_tracker.sonic_screwdriver':
      // Options for 'state' are:
      // 'home'
      // 'unknown'
      // 'unavailable'
      const trackingDeviceName = state.newState.entity_id.split('.')[1];
      if (
        trackedStatusObject.userLocation.trackedDevices.hasOwnProperty(
          trackingDeviceName,
        )
      ) {
        trackedStatusObject.userLocation.trackedDevices[trackingDeviceName] =
          state.newState.state;
      } else {
        console.log(
          `Not using ${state.newState.attributes.friendly_name} location '${state.newState.state}' to track user's location.`,
        );
      }
      const userPreviousIsHome = trackedStatusObject.userLocation.isHome;
      let userIsHome = true;
      // If ANY devices is not home, assume it is with the user that they are not home.
      for (const [, value] of Object.entries(
        trackedStatusObject.userLocation.trackedDevices,
      )) {
        if (value !== 'home') {
          // Some status are not useful, so we tag them as "home".
          userIsHome = value === 'home' || value === 'unavailable';
        }
      }
      if (userPreviousIsHome !== userIsHome) {
        trackedStatusObject.userLocation.isHome = userIsHome;
        console.log(
          `Christen has just ${userIsHome ? 'arrived home' : 'left'}.`,
        );
        console.log(trackedStatusObject.userLocation);
        pushMe(`${userIsHome ? 'Welcome home!' : "Bye. :'("}.`);
      }
      break;
    // Office Lights
    case 'light.facing_back_yard':
    case 'light.facing_closset':
    case 'light.facing_door':
    case 'light.facing_me':
      const officeLightEntryName = state.newState.entity_id.split('.')[1];
      const currentOfficeLightState = trackedStatusObject.officeLights.on;
      trackedStatusObject.officeLights[officeLightEntryName] =
        state.newState.state === 'on';
      trackedStatusObject.officeLights.on =
        trackedStatusObject.officeLights.facing_back_yard ||
        trackedStatusObject.officeLights.facing_me ||
        trackedStatusObject.officeLights.facing_door ||
        trackedStatusObject.officeLights.facing_closset;
      if (trackedStatusObject.officeLights.on !== currentOfficeLightState) {
        trackedStatusObject.officeLights.onSince = new Date();
        console.log(
          `Office Lights are now ${
            trackedStatusObject.officeLights.on ? 'on' : 'off'
          }.`,
        );

        // Do something when the lights come on
        if (!isInitialData && trackedStatusObject.officeLights.on) {
          playWav({ shortFileName: 'CastleInTheSky-RobotBeep2c' });
        }
      }
      break;

    case 'switch.office_ligjt':
      // Track the Office Wall Switch so that we can fix it if it is used.
      trackedStatusObject.officeLights.wallSwitchOff =
        state.newState.state === 'off';
      break;

    // Basically here are ALL the known events/sensors, so jump in and use one.
    // When a new one shows up, it will log to the screen until you add it here.

    // Electric Bill
    case 'sensor.8302_limerick_st_period':
    case 'sensor.8302_limerick_st_total_bill_date':
    case 'sensor.8302_limerick_st_usage_today':
    case 'sensor.8302_limerick_st_demand':
    case 'sensor.8302_limerick_st_average_demand':
    case 'sensor.8302_limerick_st_peak_demand':
    case 'sensor.8302_limerick_st_peak_time':
    case 'sensor.8302_limerick_st_max_temp':
    case 'sensor.8302_limerick_st_min_temp':
    case 'sensor.8302_limerick_st_average_temp':
    case 'sensor.8302_limerick_st_cost_today':
    case 'sensor.8302_limerick_st_balance':
    case 'sensor.8302_limerick_st_address':
    case 'sensor.8302_limerick_st_bill_amount':
    case 'sensor.8302_limerick_st_is_past_due':
      break;

    // Car
    case 'sensor.cooper_s_remaining_range_total':
    case 'sensor.cooper_s_remaining_range_fuel':
    case 'sensor.cooper_s_remaining_fuel_percent':
    case 'button.cooper_s_flash_lights':
    case 'button.cooper_s_sound_horn':
    case 'button.cooper_s_activate_air_conditioning':
    case 'button.cooper_s_deactivate_air_conditioning':
    case 'button.cooper_s_find_vehicle':
    case 'button.cooper_s_refresh_from_cloud':
      // console.log('Blue Dwarf:');
      // console.log(eventData);
      // console.log(state);
      break;
    case 'binary_sensor.cooper_s_condition_based_services':
      console.log(`Blue Dwarf VIN is ${eventData.attributes.vin}`);
      console.log(`Blue Dwarf Engine Oil is ${eventData.attributes.oil}`);
      console.log(
        `Blue Dwarf next Oil Change is on ${eventData.attributes.oil_date}`,
      );
      console.log(
        `Blue Dwarf next Oil Change is at ${eventData.attributes.oil_distance} miles.`,
      );
      console.log(
        `Blue Dwarf vehicle service check is ${eventData.attributes.vehicle_check}`,
      );
      console.log(
        `Blue Dwarf next vehicle Service Check date is ${eventData.attributes.vehicle_check_date}`,
      );
      console.log(
        `Blue Dwarf next vehicle Service Check is at ${eventData.attributes.vehicle_check_distance} miles.`,
      );
      console.log(
        `Blue Dwarf Brake Fluid is ${eventData.attributes.brake_fluid}`,
      );
      console.log(
        `Blue Dwarf next Brake Fluid check is ${eventData.attributes.brake_fluid_date}`,
      );
      break;
    case 'binary_sensor.cooper_s_check_control_messages':
      console.log(
        `Blue Dwarf Engine Oil is ${
          eventData.state === 'off' ? 'NOT ' : ' '
        }low.`,
      );
      break;
    case 'binary_sensor.cooper_s_door_lock_state':
      console.log(
        `Blue Dwarf all Doors are ${
          eventData.state === 'off' ? 'Locked.' : 'UNlocked!'
        }`,
      );
      break;
    case 'lock.cooper_s_lock':
      console.log(
        `Blue Dwarf all Doors are ${
          eventData.state === 'locked' ? 'Locked.' : 'UNlocked!'
        }`,
      );
      break;
    // TODO: Test these as clearly some might mean something less obvious like boot vs hood vs top.
    // TODO: Notify if car is unlocked.
    // TODO: Record other data of interest.
    // TODO: Notify on other possible issues?
    // console.log('Blue Dwarf:');
    // console.log(eventData.entity_id);
    // console.log(eventData.attributes);
    // console.log(eventData.state);

    // These seem to start when you subscribe to Nabu Casa
    case 'sensor.internet_time':
    case 'sensor.time_date':
    case 'sensor.date':
    case 'sensor.date_time':
    case 'sensor.date_time_iso':
    case 'sensor.date_time_utc':
    case 'sensor.time':
    case 'sensor.time_utc':
      break;

    // I think these come from SONOS speakers
    case 'number.js_robot_balance':
    case 'number.dads_rave_balance':
    case 'number.handles_balance':
    case 'number.kitchen_balance':
      break;

    case 'sensor.unnamed_room_battery':
    case 'binary_sensor.unnamed_room_power':
    case 'media_player.unnamed_room_2':
    case 'number.unnamed_room_bass_2':
    case 'number.unnamed_room_treble_2':
    case 'switch.unnamed_room_crossfade':
    case 'switch.unnamed_room_loudness':
    case 'binary_sensor.unnamed_room_microphone':

    case 'person.christen_lofland':
    case 'sun.sun':
    case 'sensor.sun_next_dawn':
    case 'sensor.sun_next_dusk':
    case 'sensor.sun_next_midnight':
    case 'sensor.sun_next_noon':
    case 'sensor.sun_next_rising':
    case 'sensor.sun_next_setting':

    case 'media_player.spotify_christen_lofland':
    case 'update.home_assistant_supervisor_update':
    case 'update.home_assistant_core_update':
    case 'update.check_home_assistant_configuration_update':
    case 'update.file_editor_update':
    case 'update.duck_dns_update':
    case 'update.terminal_ssh_update':
    case 'update.ring_mqtt_with_video_streaming_update':
    case 'update.mosquitto_broker_update':
    case 'update.home_assistant_operating_system_update':
    case 'group.office':
    case 'zone.home':
    case 'camera.octoprint':
    case 'automation.new_automation':
    case 'automation.turn_off_prusa_light_2':
    case 'binary_sensor.entertainment_area_1_entertainment_configuration':
    case 'binary_sensor.ilightshow_entertainment_configuration':
    case 'binary_sensor.ilightshow_ios_entertainment_configuration':
    case 'sensor.tech_dungeon_dimmer_switch_battery_level':

    // Hue bulb scenes
    case 'scene.tech_dungeon_bright':
    case 'scene.tech_dungeon_unity_laser_pallete':
    case 'scene.tech_dungeon_mint_desert':
    case 'scene.tech_dungeon_spring_blossom':
    case 'scene.tech_dungeon_arctic_aurora':
    case 'scene.office_overhead_starlight':
    case 'scene.tech_dungeon_energize':
    case 'scene.tech_dungeon_vapor_wave':
    case 'scene.office_overhead_normal':
    case 'scene.office_overhead_tropical_twilight':
    case 'scene.office_overhead_concentrate':
    case 'scene.tech_dungeon_corrected_tangerine':
    case 'scene.tech_dungeon_dimmed':
    case 'scene.tech_dungeon_relax':
    case 'scene.tech_dungeon_savanna_sunset':
    case 'scene.tech_dungeon_overboard_rainbow':
    case 'scene.tech_dungeon_slime_valley':
    case 'scene.tech_dungeon_concentrate':
    case 'scene.tech_dungeon_blended_grassland':
    case 'scene.tech_dungeon_tropical_twilight':
    case 'scene.tech_dungeon_nightlight':
    case 'scene.tech_dungeon_electric_beach':
    case 'scene.tech_dungeon_read':
    case 'scene.office_overhead_some_colors':
    case 'scene.office_overhead_crocus':
    case 'scene.tech_dungeon_red_dessert':
    case 'media_player.samsung_8_series_55_2':
    case 'remote.samsung_8_series_55':
    case 'light.hue_color_lamp_1_6':
    case 'light.hue_color_lamp_1_2':
    case 'light.hue_color_lamp_1_3':
    case 'light.hue_color_lamp_1':
    case 'light.east_fixture_facing_out':
    case 'light.hue_white_lamp_2':
    case 'light.hue_color_lamp_1_5':
    case 'light.east_fixture_facing_becky':
    case 'light.east_fixture_facing_window':
    case 'light.hue_color_lamp_1_4':
    case 'sensor.hue_dimmer_switch_1_battery':
    case 'light.office_closet':
    case 'light.office_fan':
    case 'light.tech_dungeon':
    case 'weather.home':
    case 'sensor.sonicscrewdriver_battery_state':
    case 'sensor.christens_ipad_battery_state_2':
    case 'sensor.christens_ipad_battery_state_3':
    case 'binary_sensor.rpi_power_status':
    case 'sensor.sm_n986u1_battery_level':
    case 'sensor.sm_n986u1_battery_state':
    case 'sensor.sm_n986u1_charger_type':
    case 'sensor.sm_n986u1_battery_health':
    case 'sensor.sm_n986u1_battery_temperature':
    case 'binary_sensor.sm_n986u1_is_charging':
    case 'sensor.amazon_kindle_fire_battery_level':
    case 'sensor.amazon_kindle_fire_battery_state':
    case 'sensor.amazon_kindle_fire_charger_type':
    case 'sensor.amazon_kindle_fire_battery_health':
    case 'sensor.amazon_kindle_fire_battery_temperature':
    case 'binary_sensor.amazon_kindle_fire_is_charging':
    case 'sensor.christens_ipad_battery_state':
    case 'sensor.christens_ipad_battery_level':
    case 'sensor.christens_ipad_bssid':
    case 'sensor.christens_ipad_storage':
    case 'sensor.christens_ipad_sim_1':
    case 'sensor.christens_ipad_connection_type':
    case 'sensor.christens_ipad_geocoded_location':
    case 'sensor.christens_ipad_ssid':
    case 'sensor.christens_ipad_last_update_trigger':
    case 'sensor.christens_ipad_activity':
    case 'binary_sensor.christens_ipad_focus':
    case 'sensor.sonic_screwdriver_activity':
    case 'sensor.sonic_screwdriver_distance':
    case 'sensor.sonic_screwdriver_steps':
    case 'sensor.sonic_screwdriver_average_active_pace':
    case 'sensor.sonic_screwdriver_floors_ascended':
    case 'sensor.sonic_screwdriver_floors_descended':
    case 'sensor.sonic_screwdriver_battery_level':
    case 'sensor.sonic_screwdriver_battery_state':
    case 'sensor.sonicscrewdriver_battery_state_2':
    case 'sensor.sonic_screwdriver_storage':
    case 'sensor.sonic_screwdriver_ssid':
    case 'sensor.sonic_screwdriver_bssid':
    case 'sensor.sonic_screwdriver_connection_type':
    case 'sensor.sonic_screwdriver_sim_2':
    case 'sensor.sonic_screwdriver_sim_1':
    case 'sensor.sonic_screwdriver_geocoded_location':
    case 'sensor.sonic_screwdriver_last_update_trigger':
    case 'binary_sensor.sonic_screwdriver_focus':
    case 'sensor.hacs':
    case 'binary_sensor.octoprint_printing':
    case 'binary_sensor.octoprint_printing_error':
    case 'sensor.octoprint_actual_a_temp':
    case 'sensor.octoprint_target_a_temp':
    case 'sensor.octoprint_actual_e_temp':
    case 'sensor.octoprint_target_e_temp':
    case 'sensor.octoprint_actual_p_temp':
    case 'sensor.octoprint_target_p_temp':
    case 'sensor.octoprint_actual_w_temp':
    case 'sensor.octoprint_target_w_temp':
    case 'sensor.octoprint_actual_bed_temp':
    case 'sensor.octoprint_target_bed_temp':
    case 'sensor.octoprint_actual_tool0_temp':
    case 'sensor.octoprint_target_tool0_temp':
    case 'sensor.octoprint_current_state':
    case 'sensor.octoprint_job_percentage':
    case 'sensor.octoprint_estimated_finish_time':
    case 'sensor.octoprint_start_time':
    case 'button.octoprint_resume_job':
    case 'button.octoprint_pause_job':
    case 'button.octoprint_stop_job':
    case 'binary_sensor.front_door_ding':
    case 'binary_sensor.front_door_motion':
    case 'binary_sensor.back_porch_motion':
    case 'light.back_porch_light':
    case 'sensor.front_door_battery':
    case 'sensor.front_door_volume':
    case 'sensor.back_porch_battery':
    case 'sensor.back_porch_volume':
    case 'switch.back_porch_siren':
    case 'sensor.front_door_last_activity':
    case 'sensor.back_porch_last_activity':
    case 'sensor.front_door_last_ding':
    case 'sensor.front_door_last_motion':

    // RING Cameras
    case 'camera.front_door':
    case 'sensor.back_porch_last_motion':
    case 'camera.back_porch':
    case 'camera.mobile_camera':
    case 'binary_sensor.mobile_camera_motion':
    case 'sensor.mobile_camera_battery':
    case 'sensor.mobile_camera_volume':
    case 'switch.mobile_camera_siren':
    case 'sensor.mobile_camera_last_activity':
    case 'sensor.mobile_camera_last_motion':
      break;

    // Ring Alarm Doors
    case 'sensor.back_door_kitchen_info':
    case 'sensor.back_door_kitchen_battery':
    case 'binary_sensor.back_door_kitchen_tamper':
    case 'select.back_door_kitchen_bypass_mode':
      break;
    case 'binary_sensor.back_door_kitchen':
      doorOpenClosedGenericResponse({
        friendlyName: 'Back Door to Kitchen',
        simplifiedName: 'kitchenBackDoorOpen',
        state,
        isInitialData,
      });
      break;
    case 'sensor.back_door_living_room_info':
    case 'sensor.back_door_living_room_battery':
    case 'binary_sensor.back_door_living_room_tamper':
    case 'select.back_door_living_room_bypass_mode':
      break;
    case 'binary_sensor.back_door_living_room':
      doorOpenClosedGenericResponse({
        friendlyName: 'Living Room Back Door',
        simplifiedName: 'livingRoomDoorOpen',
        state,
        isInitialData,
      });
      break;
    case 'sensor.kitchen_window_info':
    case 'sensor.kitchen_window_battery':
    case 'binary_sensor.kitchen_window_tamper':
    case 'select.kitchen_window_bypass_mode':
      break;
    case 'binary_sensor.kitchen_window':
      doorOpenClosedGenericResponse({
        friendlyName: 'Kitchen Window',
        simplifiedName: 'kitchenWindowOpen',
        state,
        isInitialData,
        doorType: 'window',
      });
      break;
    // Garage - Back Door
    case 'sensor.back_door_garage_info':
    case 'sensor.back_door_garage_battery':
    case 'binary_sensor.back_door_garage_tamper':
    case 'select.back_door_garage_bypass_mode':
      break;
    case 'binary_sensor.back_door_garage':
      doorOpenClosedGenericResponse({
        friendlyName: 'Back Door to Garage',
        simplifiedName: 'backDoorToGarageOpen',
        state,
        isInitialData,
      });
      break;
    case 'sensor.front_door_info':
    case 'sensor.front_door_battery_2':
    case 'binary_sensor.front_door_tamper':
    case 'select.front_door_bypass_mode':
      break;
    case 'binary_sensor.front_door':
      doorOpenClosedGenericResponse({
        friendlyName: 'Front Door',
        simplifiedName: 'frontDoorOpen',
        state,
        isInitialData,
      });
      break;

    // Garage - East Door
    case 'sensor.garage_door_east_info':
    case 'sensor.garage_door_east_battery':
    case 'binary_sensor.garage_door_east_tamper':
    case 'select.garage_door_east_bypass_mode':
      break;
    case 'binary_sensor.garage_door_east':
      doorOpenClosedGenericResponse({
        friendlyName: 'East Garage Door',
        simplifiedName: 'eastDoorToGarageOpen',
        state,
        isInitialData,
        doorType: 'garage',
      });
      break;
    // Garage - West Door
    case 'sensor.garage_door_west_info':
    case 'sensor.garage_door_west_battery':
    case 'binary_sensor.garage_door_west_tamper':
    case 'select.garage_door_west_bypass_mode':
      break;
    case 'binary_sensor.garage_door_west':
      doorOpenClosedGenericResponse({
        friendlyName: 'West Garage Door',
        simplifiedName: 'westDoorToGarageOpen',
        state,
        isInitialData,
        doorType: 'garage',
      });
      break;
    // Garage - Kitchen Door
    case 'sensor.door_to_garage_info':
    case 'sensor.door_to_garage_battery':
    case 'binary_sensor.door_to_garage_tamper':
    case 'select.door_to_garage_bypass_mode':
      break;
    case 'binary_sensor.door_to_garage':
      doorOpenClosedGenericResponse({
        friendlyName: 'Kitchen Door To Garage',
        simplifiedName: 'kitchenDoorToGarageOpen',
        state,
        isInitialData,
      });
      break;

    // GARAGE
    // Garage - Motion Sensor
    case 'sensor.garage_motion_sensor_info':
    case 'sensor.garage_motion_sensor_battery':
    case 'binary_sensor.garage_motion_sensor_tamper':
    case 'select.garage_motion_sensor_bypass_mode':
      break;
    case 'binary_sensor.garage_motion_sensor':
      // Garage Motion Sensor
      if (
        state.newState.hasOwnProperty('state') &&
        state.newState.state === 'on'
      ) {
        await persistentData.set('garageMotionDetected');
        console.log('Motion detected in Garage.');
      }
      break;

    case 'switch.3d_printer_socket_1':
    case 'switch.office_lamp_socket_1':
    case 'switch.lava_lamp_socket_1':
    case 'camera.octoprint_camera':
    case 'switch.sonos_alarm_1':
    case 'media_player.dad_s_rave':
    case 'number.dad_s_rave_bass':
    case 'number.dad_s_rave_treble':
    case 'switch.sonos_dad_s_rave_crossfade':
    case 'switch.dads_rave_loudness':
    case 'media_player.unnamed_room':
    case 'number.unnamed_room_bass':
    case 'number.unnamed_room_treble':
    case 'switch.sonos_unnamed_room_crossfade':
    case 'switch.js_robot_loudness':
    case 'binary_sensor.js_robot_microphone':
    case 'media_player.kitchen':
    case 'number.kitchen_bass':
    case 'number.kitchen_treble':
    case 'switch.sonos_kitchen_crossfade':
    case 'switch.kitchen_loudness':
    case 'automation.minecraft_server':
    case 'binary_sensor.remote_ui':
    case 'sensor.hp_color_laserjet_pro_m478f_9f_black_cartridge':
    case 'sensor.hp_color_laserjet_pro_m478f_9f_cyan_cartridge':
    case 'sensor.hp_color_laserjet_pro_m478f_9f_magenta_cartridge':
    case 'sensor.hp_color_laserjet_pro_m478f_9f_yellow_cartridge':
    case 'sensor.hp_color_laserjet_pro_m478f_9f':
    case 'media_player.office':
    case 'media_player.samsung_8_series_55':
    case 'media_player.chromecastultra3539':
    case 'binary_sensor.main_viewscreen_headphones_connected':
    case 'binary_sensor.main_viewscreen_supports_airplay':
    case 'binary_sensor.main_viewscreen_supports_ethernet':
    case 'binary_sensor.main_viewscreen_supports_find_remote':
    case 'sensor.main_viewscreen_active_app':
    case 'sensor.main_viewscreen_active_app_id':
    case 'media_player.main_viewscreen':
    case 'remote.main_viewscreen':
    case 'sensor.wichita_bridge_info':
    case 'binary_sensor.wichita_bridge_tamper':
    case 'sensor.wichita_base_station_info':
    case 'binary_sensor.wichita_base_station_tamper':
    case 'sensor.wichita_alarm_info':
    case 'binary_sensor.wichita_alarm_tamper':
    case 'alarm_control_panel.wichita_alarm':
    case 'switch.wichita_siren':
    case 'sensor.wichita_range_extender_info':
    case 'sensor.wichita_range_extender_battery':
    case 'binary_sensor.wichita_range_extender_tamper':
      break;

    // RING Keypads
    // Office RING Keypad
    case 'binary_sensor.office_keypad_motion':
    case 'sensor.office_keypad_info':
    case 'sensor.office_keypad_battery':
    case 'binary_sensor.office_keypad_tamper':
    case 'number.office_keypad_volume':

    // Bedroom RING Keypad
    case 'binary_sensor.master_bedroom_keypad_motion':
    case 'sensor.master_bedroom_keypad_info':
    case 'sensor.master_bedroom_keypad_battery':
    case 'binary_sensor.master_bedroom_keypad_tamper':
    case 'number.master_bedroom_keypad_volume':

    // Philips Hue keypads:
    case 'event.office_dimmer_switch_button_1':
    case 'event.office_dimmer_switch_button_2':
    case 'event.office_dimmer_switch_button_3':
    case 'event.office_dimmer_switch_button_4':
    case 'event.tech_dungeon_dimmer_switch_button_1':
    case 'event.tech_dungeon_dimmer_switch_button_2':
    case 'event.tech_dungeon_dimmer_switch_button_3':
    case 'event.tech_dungeon_dimmer_switch_button_4':

    case 'sensor.basement_info':
    case 'sensor.basement_battery':
    case 'binary_sensor.basement_tamper':
    case 'select.basement_bypass_mode':
    case 'sensor.playroom_flood_freeze_sensor_info':
    case 'sensor.playroom_flood_freeze_sensor_battery':
    case 'binary_sensor.playroom_flood_freeze_sensor_tamper':
    case 'binary_sensor.playroom_flood_freeze_sensor':
    case 'binary_sensor.playroom_flood_freeze_sensor_2':
    case 'sensor.laundry_room_flood_freeze_sensor_info':
    case 'sensor.laundry_room_flood_freeze_sensor_battery':
    case 'binary_sensor.laundry_room_flood_freeze_sensor_tamper':
    case 'binary_sensor.laundry_room_flood_freeze_sensor':
    case 'binary_sensor.laundry_room_flood_freeze_sensor_2':
    case 'number.wichita_base_station_volume':
      break;

    // These seem to be device tracker entities that I don't actually have?
    // Perhaps something built into iPhone setup now?
    case 'device_tracker.blesmart_0000015f005fbf99df24':
    case 'sensor.blesmart_0000015f005fbf99df24_estimated_distance':
    case 'device_tracker.rivian_phone_key_ee35':
    case 'device_tracker.rivian_sensor_4_def8':
    case 'sensor.rivian_sensor_4_def8_estimated_distance':
    case 'sensor.rivian_phone_key_ee35_estimated_distance':
      if (!isInitialData) {
        console.log(eventData);
      }
      break;

    case 'persistent_notification.config_entry_discovery':
      break;

    // WLED
    case 'sensor.wled_estimated_current':
    case 'switch.wled_sync_receive':
    case 'light.wled':
    case 'light.wled_segment_1':
    case 'light.wled_segment_2':
    case 'light.wled_segment_3':
    case 'light.wled_segment_4':
    case 'number.wled_speed':
    case 'number.wled_intensity':
    case 'number.wled_segment_1_speed':
    case 'number.wled_segment_1_intensity':
    case 'number.wled_segment_2_speed':
    case 'number.wled_segment_2_intensity':
    case 'number.wled_segment_3_speed':
    case 'number.wled_segment_3_intensity':
    case 'number.wled_segment_4_speed':
    case 'number.wled_segment_4_intensity':
    case 'select.wled_live_override':
    case 'select.wled_playlist':
    case 'select.wled_preset':
    case 'select.wled_color_palette':
    case 'select.wled_segment_1_color_palette':
    case 'select.wled_segment_2_color_palette':
    case 'select.wled_segment_3_color_palette':
    case 'select.wled_segment_4_color_palette':
    case 'sensor.wled_led_count':
    case 'sensor.wled_max_current':
    case 'switch.wled_nightlight':
    case 'switch.wled_sync_send':
    case 'switch.wled_reverse':
    case 'switch.wled_segment_1_reverse':
    case 'switch.wled_segment_2_reverse':
    case 'switch.wled_segment_3_reverse':
    case 'switch.wled_segment_4_reverse':
    case 'button.wled_restart':
    case 'update.wled_firmware':
      break;
    case 'light.wled_master':
      trackedStatusObject.wled.on = state.newState.state === 'on';
      break;
    case 'sensor.wled_ip':
      trackedStatusObject.wledIp = eventData.state;
      break;

    // Automations also fire events!
    case 'automation.office_motion_lights':
    case 'automation.blue_dwarf_status_updates':
    case 'automation.office_motion_switch_reset':
      break;

    // LCARS
    case 'input_boolean.lcars_sound':
    case 'input_boolean.lcars_texture':
      break;

    default:
      console.log(eventData.entity_id);
  }
}

function handleWebsocketInput(input) {
  if (
    input.id === 2 &&
    input.type === 'result' &&
    input.success === true &&
    input.result === null
  ) {
    console.log('Home Assistant initial connect validated.');
  } else if (input.type === 'pong') {
    // Server is responding
    trackedStatusObject.lastPong = new Date();
  } else if (
    input.hasOwnProperty('event') &&
    input.event.hasOwnProperty('data') &&
    input.event.data.hasOwnProperty('entity_id') &&
    input.event.data.hasOwnProperty('old_state') &&
    input.event.data.hasOwnProperty('new_state')
  ) {
    // These are the real time updates
    handleEntriesWithEventData(input.event.data);
  } else if (
    input.hasOwnProperty('type') &&
    input.type === 'result' &&
    input.hasOwnProperty('success') &&
    input.success === true &&
    input.hasOwnProperty('result') &&
    Array.isArray(input.result)
  ) {
    // This is the initial set of all values when connecting
    input.result.forEach((entry) => {
      if (entry.hasOwnProperty('entity_id')) {
        handleEntriesWithEventData(entry, true);
      }
    });
  } else if (
    input.hasOwnProperty('event') &&
    input.event.hasOwnProperty('event_type') &&
    input.event.event_type === 'automation_triggered' &&
    input.event.hasOwnProperty('data') &&
    input.event.data.hasOwnProperty('name')
  ) {
    // Automation Triggered
    switch (input.event.data.name) {
      case 'Blue Dwarf Status Updates':
        break;
      default:
        console.log(`HA Automation: ${input.event.data.name}`);
    }
    // If we want to see more info on these automations, add more console logs
    // or if we want to act on these in some way, add a full on function with a switch case.
  } else if (
    input.hasOwnProperty('event') &&
    input.event.hasOwnProperty('event_type') &&
    input.event.event_type === 'call_service' &&
    input.event.hasOwnProperty('data') &&
    input.event.data.hasOwnProperty('domain') &&
    input.event.data.hasOwnProperty('service') &&
    input.event.data.hasOwnProperty('service_data') &&
    input.event.data.service_data.hasOwnProperty('entity_id') &&
    Array.isArray(input.event.data.service_data.entity_id)
  ) {
    // Service Called
    input.event.data.service_data.entity_id.forEach((service) => {
      switch (service) {
        case 'binary_sensor.cooper_s_door_lock_state':
          if (
            input.event.data.domain === 'homeassistant' &&
            input.event.data.service === 'update_entity'
          ) {
            console.log('Blue Dwarf telemetry received.');
          } else {
            console.log(
              `HA Service: ${input.event.data.domain} ${input.event.data.service} ${service}`,
            );
          }
          break;
        case 'scene.office_overhead_normal':
          if (input.event.data.service === 'turn_on') {
            console.log('Office Lights set to Normal.');
          } else {
            console.log(
              `HA Service: ${input.event.data.domain} ${input.event.data.service} ${service}`,
            );
          }
          break;
        default:
          console.log(
            `HA Service: ${input.event.data.domain} ${input.event.data.service} ${service}`,
          );
      }
    });
    // If we want to see more info on these automations, add more console logs
    // or if we want to act on these in some way, add a full on function with a switch case.
  } else if (
    input.hasOwnProperty('type') &&
    input.type === 'result' &&
    input.hasOwnProperty('result') &&
    input.hasOwnProperty('success') &&
    input.hasOwnProperty('id') &&
    sentRequests.has(input.id)
  ) {
    // Result of a sent request
    console.log(
      `${sentRequests.get(input.id)}: ${
        input.success ? 'Succeeded' : 'Failed'
      }`,
    );
  } else if (
    input.type === 'event' &&
    input.hasOwnProperty('event') &&
    input.event.hasOwnProperty('event_type')
  ) {
    // Simple events
    switch (input.event.event_type) {
      case 'call_service':
      case 'hue_event':
      case 'recorder_5min_statistics_generated':
      case 'recorder_hourly_statistics_generated':
      case 'lovelace_updated':
      case 'entity_registry_updated':
      case 'persistent_notifications_updated':
      case 'config_entry_discovered':
        // I think entity_registry_updated happens when a lovelace card is updated.
        break;
      case 'homeassistant_started':
        console.log('Home Assistant just started.');
        break;
      case 'core_config_updated':
        console.log('Home Assistant CORE Config updated.');
        break;
      case 'homeassistant_stop':
        console.log('Home Assistant going down!');
        break;
      default:
        console.log(`Unknown HA Event: ${input.event.event_type}`);
    }
  } else {
    console.log('Unknown Websocket input type from Home Assistant:');
    console.log(input);
  }
}

let authenticated = false;
let id = 0;
ws.on('open', () => {
  console.log('Connected to Home Assistant.');
});

ws.on('message', (data) => {
  const dataObject = JSON.parse(data);
  if (dataObject.type === 'auth_required') {
    ws.send(
      JSON.stringify({
        type: 'auth',
        access_token: configObject.token,
      }),
    );
  } else if (dataObject.type === 'auth_ok') {
    authenticated = true;

    // Do an initial dump of all events to baseline our data
    // https://developers.home-assistant.io/docs/api/websocket/#fetching-states
    id++;
    ws.send(JSON.stringify({ id, type: 'get_states' }));

    // Subscribe to everything.
    id++;
    ws.send(
      JSON.stringify({
        id,
        type: 'subscribe_events',
      }),
    );
  } else if (authenticated) {
    handleWebsocketInput(dataObject);
  }
});

// Start web server
await webserver();

const hasBootedSemaphoreFile = `/tmp/OracFirstStarupAfterBoot`;
// Things to do ONLY after first boot of device
await new Promise((resolve) => {
  fs.readFile(hasBootedSemaphoreFile, async (readFileErr) => {
    if (readFileErr) {
      console.log('Initial device boot...');
      await spawnProcess({ path: `${__dirname}/../pi/scripts/fanOff.sh` });
      console.log('Fan is OFF');
      await spawnProcess({ path: `${__dirname}/../pi/scripts/ledsOff.sh` });
      console.log('LEDs are OFF');
      await spawnProcess({
        path: `python`,
        args: [`${__dirname}/../pi/utils/init_sound_card.py`],
      });
      console.log('Sound card is initialized.');
      const volume = 380;
      await spawnProcess({
        path: `python`,
        args: [`${__dirname}/../pi/utils/set_volume.py`, volume],
      });
      console.log(`Volume is set to ${volume}`);

      fs.writeFile(hasBootedSemaphoreFile, 'DONE\n', (writeFileErr) => {
        if (writeFileErr) {
          console.error('Error writing first boot file:');
          console.error(writeFileErr);
        }
      });
    }
    resolve();
  });
});

// Things done on startup
speak('Hello World');

while (trackedStatusObject.keepRunning) {
  await wait(1000 * 60); // Delay between rechecks

  // Reboot after 2am Daily
  // NOTE: Not doing this, as there is no need and it causes unneeded churn and noise.
  // const upTimeHours = os.uptime() / 60 / 60;
  // const hour = new Date().getHours();
  // if (hour === 2 && upTimeHours > 2) {
  //   console.log('Initiating Daily Reboot');
  //   await spawnProcess({ path: 'sudo', args: ['shutdown', `-r`, `now`] });
  // }

  // Calculate how long the office lights have been on
  const officeLightsOnMinutes =
    new Date().getMinutes() -
    trackedStatusObject.officeLights.onSince.getMinutes();

  // Send PING's periodically and shut down if no response, so that PM2 will restart this.
  // Check last PONG time and send new PING
  if (new Date().getMinutes() - trackedStatusObject.lastPong.getMinutes() > 3) {
    console.error('Connection to Home Assistant appears to be down!');
    trackedStatusObject.keepRunning = false;
  } else {
    // Send a new PING
    id++;
    ws.send(
      JSON.stringify({
        id,
        type: 'ping',
      }),
    );
  }

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  // Send Charge Watch notice
  //  - Christen is HOME
  //  - Office Lights are On
  //  - and have been on for over 30 minutes.
  //  - Watch battery < X %
  //  - Watch battery not currently charging
  //  - Time of day is between 8am and 5pm
  //  - Last message sent was not today.
  if (
    trackedStatusObject.userLocation.isHome &&
    trackedStatusObject.officeLights.on &&
    officeLightsOnMinutes > 30 &&
    trackedStatusObject.watchBattery.level < 90 &&
    !trackedStatusObject.watchBattery.isCharging &&
    currentHour > 7 &&
    currentHour < 17
  ) {
    // First check when we last sent a message, so we don't send duplicates
    const pleaseChargeWatchBatteryLastMessageSent = await persistentData.get(
      'pleaseChargeWatchBatteryLastMessageSent',
    );
    // Check timestamp
    if (!isToday(new Date(pleaseChargeWatchBatteryLastMessageSent.timestamp))) {
      // First update last sent time in database
      await persistentData.set('pleaseChargeWatchBatteryLastMessageSent');
      const message = 'Please charge your watch.';
      console.log(message);
      pushMe(message);
    }
  }

  // Turn off Office Lights if
  // - Office lights are on
  // - Last motion was greater than 30 minutes ago
  const turnOffOfficeLightsAfterMinutes = 60;
  if (trackedStatusObject.officeLights.on) {
    const officeMotionDetected = await persistentData.get(
      'officeMotionDetected',
    );
    const lastOfficeMotionDetectedMinutesAgo =
      (new Date().getTime() - officeMotionDetected.timestamp) / 1000 / 60;
    if (lastOfficeMotionDetectedMinutesAgo > turnOffOfficeLightsAfterMinutes) {
      console.log('Turning off office lights due to inactivity.');
      id++;
      ws.send(
        JSON.stringify({
          id,
          type: 'call_service',
          domain: 'light',
          service: 'turn_off',

          target: {
            entity_id: 'light.office_fan',
          },
        }),
      );
    }
  }

  // Remind to stand up if
  //  - User is home
  //  - Office Lights are on (probably in office)
  //  - And have been on for over 15 minutes.
  //  - Minutes is > 29
  //  - Last message sent more than 30 minutes ago
  //  - TODO: Any way to check activity data? sensor.sonic_screwdriver_activity
  if (
    trackedStatusObject.userLocation.isHome &&
    trackedStatusObject.officeLights.on &&
    officeLightsOnMinutes > 15 &&
    currentHour > 6 &&
    currentHour < 18 &&
    currentMinute > 29
  ) {
    // TODO: I'd like this to always hit at a certain time period like between 40 and 50 minutes after the hour or 30 and 40, but something consistent, so it isn't sometimes happening at :58
    // First check when we last sent a message, so we don't send duplicates
    const standUpLastMessageSent = await persistentData.get(
      'standUpLastMessageSent',
    );
    const lastSentMinutesAgo =
      (new Date().getTime() - standUpLastMessageSent.timestamp) / 1000 / 60; // Minutes
    if (lastSentMinutesAgo > 30) {
      await persistentData.set('standUpLastMessageSent');
      const message = 'Stand up!';
      console.log(message);
      pushMe(message);
    }
  }

  // Turn off Dalek lights if all garage doors are closed, and no motion is detected for X minutes\
  if (trackedStatusObject.wled.on) {
    console.log('Turning off Dalek lights.');
    id++;
    sentRequests.set(id, 'Turning off Dalek lights');
    ws.send(
      JSON.stringify({
        id,
        type: 'call_service',
        domain: 'light',
        service: 'turn_off',

        target: {
          entity_id: 'light.wled_master',
        },
      }),
    );
  }

  // await HttpRequest({
  //   url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/-1000`,
  // });
  // await wait(1000);
  // await HttpRequest({
  //   url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/1000`,
  // });
  // await wait(1000);
  // await HttpRequest({
  //   url: `http://${dalekOneConnectInfo.ip}/servo/eyeStalk/0`,
  // });
  // await wait(1000);

  // TODO: Notify me if any lights are on after 10pm and no motion in office in a while.
  // TODO: Notify me at 10pm if any sensors in the alarm system are not clear.
  // TODO: Notify me if any garage door stays open for longer than X hours.
  // TODO: Notify me at 9pm if I'm not done with all of my exercise, or at least ask.
  // TODO: Notify me if my car gas is low.
  // TODO: Notify me if my car is unlocked or windows down or top down when I'm not moving?
  // TODO: Track requests (by ID) and note when responses relate to those requests.
  // TODO: Ambient noises.
  // TODO: Note if I'm in the office with no music playing and suggest something.
  // TODO: Hook up button board  and have it like flash a light somewhere with a color to indicate a "need to do" and I press it to clear it as "done". Screen could show what color is what thing.
  // TODO: Find some way to display information to the screen.
  // TODO: DIM screen when all hue lights are off.
}

console.error('Orac is shutting down.');
process.exit(); // Because of the webserver it won't just close on its own.

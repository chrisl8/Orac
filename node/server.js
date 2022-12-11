/* eslint-disable no-case-declarations,no-fallthrough,no-await-in-loop */
import WebSocket from 'ws';
import getHomeAssistantConfig from './getHomeAssistantConfig.js';
import wait from './wait.js';
import makeRandomNumber from './makeRandomNumber.js';
import trackedStatusObject from './trackedStatusObject.js';
import persistentData from './persistentKeyValuePairs.js';
import pushMe from './pushMe.js';
import isToday from './dateIsToday.js';

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

async function handleEntriesWithEventData(eventData) {
  const state = getStateFromEventOrState(eventData);
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
    case 'device_tracker.cooper_s':
    case 'device_tracker.sonicscrewdriver':
    case 'device_tracker.christens_ipad_2':
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
        // TODO: Send a Pushover (free) message about leaving/arriving home.
        // TODO: This might need to be rate limited?
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
        console.log(
          `Office Lights are now ${
            trackedStatusObject.officeLights.on ? 'on' : 'off'
          }.`,
        );
      }
      break;

    case 'switch.office_ligjt':
      // Track the Office Wall Switch so that we can fix it if it is used.
      trackedStatusObject.officeLights.wallSwitchOff =
        state.newState.state === 'off';
      break;

    // Basically here are ALL the known events/sensors, so jump in and use one.
    // When a new one shows up, it will log to the screen until you add it here.

    // Car
    case 'binary_sensor.cooper_s_lids':
    case 'binary_sensor.cooper_s_windows':
    case 'binary_sensor.cooper_s_door_lock_state':
    case 'binary_sensor.cooper_s_condition_based_services':
    case 'binary_sensor.cooper_s_check_control_messages':
    case 'lock.cooper_s_lock':
    case 'sensor.cooper_s_remaining_range_total':
    case 'sensor.cooper_s_mileage':
    case 'sensor.cooper_s_remaining_fuel':
    case 'sensor.cooper_s_remaining_range_fuel':
    case 'sensor.cooper_s_remaining_fuel_percent':
    case 'button.cooper_s_flash_lights':
    case 'button.cooper_s_sound_horn':
    case 'button.cooper_s_activate_air_conditioning':
    case 'button.cooper_s_deactivate_air_conditioning':
    case 'button.cooper_s_find_vehicle':
    case 'button.cooper_s_refresh_from_cloud':

    case 'person.christen_lofland':
    case 'sun.sun':
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
    case 'media_player.samsung_8_series_55_2':
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
    case 'light.office_closet':
    case 'light.office_fan':
    case 'light.tech_dungeon':
    case 'weather.home':
    case 'sensor.sonicscrewdriver_battery_state':
    case 'sensor.christens_ipad_battery_state_2':
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
    case 'camera.front_door':
    case 'sensor.back_porch_last_motion':
    case 'camera.back_porch':
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
    case 'sensor.back_door_kitchen_info':
    case 'sensor.back_door_kitchen_battery':
    case 'binary_sensor.back_door_kitchen_tamper':
    case 'binary_sensor.back_door_kitchen':
    case 'select.back_door_kitchen_bypass_mode':
    case 'sensor.wichita_range_extender_info':
    case 'sensor.wichita_range_extender_battery':
    case 'binary_sensor.wichita_range_extender_tamper':
    case 'sensor.garage_motion_sensor_info':
    case 'sensor.garage_motion_sensor_battery':
    case 'binary_sensor.garage_motion_sensor_tamper':
    case 'binary_sensor.garage_motion_sensor':
    case 'select.garage_motion_sensor_bypass_mode':
    case 'sensor.back_door_living_room_info':
    case 'sensor.back_door_living_room_battery':
    case 'binary_sensor.back_door_living_room_tamper':
    case 'binary_sensor.back_door_living_room':
    case 'select.back_door_living_room_bypass_mode':
    case 'sensor.door_to_garage_info':
    case 'sensor.door_to_garage_battery':
    case 'binary_sensor.door_to_garage_tamper':
    case 'binary_sensor.door_to_garage':
    case 'select.door_to_garage_bypass_mode':
    case 'sensor.office_keypad_info':
    case 'sensor.office_keypad_battery':
    case 'binary_sensor.office_keypad_tamper':
    case 'number.office_keypad_volume':
    case 'sensor.front_door_info':
    case 'sensor.front_door_battery_2':
    case 'binary_sensor.front_door_tamper':
    case 'binary_sensor.front_door':
    case 'select.front_door_bypass_mode':
    case 'sensor.back_door_garage_info':
    case 'sensor.back_door_garage_battery':
    case 'binary_sensor.back_door_garage_tamper':
    case 'binary_sensor.back_door_garage':
    case 'select.back_door_garage_bypass_mode':
    case 'sensor.garage_door_east_info':
    case 'sensor.garage_door_east_battery':
    case 'binary_sensor.garage_door_east_tamper':
    case 'binary_sensor.garage_door_east':
    case 'select.garage_door_east_bypass_mode':
    case 'sensor.garage_door_west_info':
    case 'sensor.garage_door_west_battery':
    case 'binary_sensor.garage_door_west_tamper':
    case 'binary_sensor.garage_door_west':
    case 'select.garage_door_west_bypass_mode':
    case 'sensor.master_bedroom_keypad_info':
    case 'sensor.master_bedroom_keypad_battery':
    case 'binary_sensor.master_bedroom_keypad_tamper':
    case 'number.master_bedroom_keypad_volume':
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
    case 'sensor.kitchen_window_info':
    case 'sensor.kitchen_window_battery':
    case 'binary_sensor.kitchen_window_tamper':
    case 'binary_sensor.kitchen_window':
    case 'select.kitchen_window_bypass_mode':
    case 'number.wichita_base_station_volume':

    // Automations also fire events!
    case 'automation.office_motion_lights':
    case 'automation.blue_dwarf_status_updates':
    case 'automation.office_motion_switch_reset':
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
    handleEntriesWithEventData(input.event.data);
  } else if (
    input.hasOwnProperty('type') &&
    input.type === 'result' &&
    input.hasOwnProperty('success') &&
    input.success === true &&
    input.hasOwnProperty('result') &&
    Array.isArray(input.result)
  ) {
    input.result.forEach((entry) => {
      if (entry.hasOwnProperty('entity_id')) {
        handleEntriesWithEventData(entry);
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
    console.log(`Automation Triggered: ${input.event.data.name}`);
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
    const services = input.event.data.service_data.entity_id.join(' ');
    console.log(
      `Service Called: ${input.event.data.domain} ${input.event.data.service} ${services}`,
    );
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
    console.log('Request result:');
    console.log(sentRequests.get(input.id));
    console.log(`${input.success ? 'Succeeded' : 'Failed'}`);
    console.log(input.result);
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

// TODO: Send PING's periodically and shut down if no response, so that PM2 will restart this.

const keepTrying = true;
while (keepTrying) {
  await wait(1000 * 60); // Delay between rechecks

  // Check last PONG time and send new PING
  if (new Date().getMinutes() - trackedStatusObject.lastPong.getMinutes() > 3) {
    console.error('Connection to Home Assistant appears to be down!');
    process.exit(1);
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
  //  - Watch battery < X %
  //  - Watch battery not currently charging
  //  - Time of day is between 8am and 5pm
  //  - Last message sent was not today.
  if (
    trackedStatusObject.userLocation.isHome &&
    trackedStatusObject.officeLights.on &&
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
  if (trackedStatusObject.officeLights.on) {
    const officeMotionDetected = await persistentData.get(
      'officeMotionDetected',
    );
    const lastOfficeMotionDetectedMinutesAgo =
      (new Date().getTime() - officeMotionDetected.timestamp) / 1000 / 60;
    if (lastOfficeMotionDetectedMinutesAgo > 30) {
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
  //  - Minutes is > 29
  //  - Last message sent more than 30 minutes ago
  //  - TODO: Any way to check activity data? sensor.sonic_screwdriver_activity
  if (
    trackedStatusObject.userLocation.isHome &&
    trackedStatusObject.officeLights.on &&
    currentHour > 6 &&
    currentHour < 18 &&
    currentMinute > 29
  ) {
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

  // TODO: Notify me if any lights are on after 10pm and no motion in office in a while.
  // TODO: Notify me at 10pm if any sensors in the alarm system are not clear.
  // TODO: Notify me if any garage door stays open for longer than X hours.
  // TODO: Notify me at 9pm if I'm not done with all of my exercise, or at least ask.
  // TODO: Notify me if my car gas is low.
  // TODO: Notify me if my car is unlocked or windows down or top down when I'm not moving?
  // TODO: Track requests (by ID) and note when responses relate to those requests.
}

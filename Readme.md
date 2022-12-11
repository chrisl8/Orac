TODO:

Alert me when watch is fully charged, so I can put it back on.

Check if:
 - Watch is not fully or almost fully charged
 - and I haven't charged it today
 - and I appear to be in my office
   - Not known to be away from home and
   - Motion sensor recent
   - Lights on in office
 - then alert me to charge my watch.

Some events happen on HA. It has its own "automations" but I find them clunky,
but could i have HA essentially CALL this API instead of polling a LOT?
Or should I just poll A LOT?

If the wall switch in the office is turned off:
1. Turn off all office lights.
2. Turn the wall switch back on. ;)

When watch is 100% charged, alert me to put it back on.
battery_status: 'Charged',
battery: 100,


Things HA is doing by itself already:
Turn on office lights when Office motion happens.

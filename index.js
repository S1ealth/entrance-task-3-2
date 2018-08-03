function smartHouseEnergyCalculator(inputPath) {
  const fs = require('fs');
  function watToKwat (wat) { return wat / 1000 }
  function kwatToWat (kwat) { return kwat * 1000 }
  function ratesSort(a, b) { return a.value - b.value }
  let output = {};
  let tarifMatrix = Array(24);
  output.schedule = {};
  output.consumedEnergy = {
    value:0,
    devices: {}
  }
  fs.readFile(inputPath, (err,data) => {
    if(err) throw (err);
    try {
      data = JSON.parse(data);
    } catch (error) {
        throw (error);
    }
    const rates = data.rates;
    const devices = data.devices;
    const maxPower = data.maxPower;
    rates.sort(ratesSort);
    console.log(rates);
    rates.forEach(
      (rate) => {
        if(rate.from == 23) {
          tarifMatrix.fill(rate.value,23);
          tarifMatrix.fill(rate.value,0,rate.to);
        }
        tarifMatrix.fill(rate.value,rate.from,rate.to);
      });
    tarifMatrix.forEach(
      (cost, hour) => {
        output.schedule[hour] = {
          cost:cost,
          powerLimit: maxPower,
          devices: []
        };
      })
    console.log('matrix ready');
    console.log(output.schedule);
    devices.forEach(
      (device) => {
        if (device.mode == 'day') {
          let mode = {from:7, to: 21}
          let optimalH = [];
          console.log('day mode detected. assining mode to days');
            for (const key in output.schedule) {
              if (key <= mode.to && key >= mode.from) {
                optimalH.push({hour: key,value: output.schedule[key].cost})
              }
            }
            optimalH.sort(ratesSort)
            let totalCost = 0;
            for (let i = 0; i < device.duration; i++) {
              let targetHour = optimalH[i].hour;
              let hourCost = watToKwat(device.power)*optimalH[i].value;
              if (output.schedule[targetHour].powerLimit >= device.power) {
                output.schedule[targetHour].devices.push(device.id)
                output.schedule[targetHour].powerLimit = output.schedule[targetHour].powerLimit - device.power;
                output.consumedEnergy.value = output.consumedEnergy.value + hourCost;
                totalCost = totalCost + hourCost;
              } else {
                console.log('no free grid power');
              }
              output.consumedEnergy.devices[device.id] = totalCost;
            }
        } else if (device.mode == 'night') {
          let mode = {from:21, to: 7}
          let optimalH = [];
          console.log('night mode detected. assining mode to days');
            for (const key in output.schedule) {
              if (key >= mode.from || key <= mode.to) {
                optimalH.push(
                  {
                    hour: key,
                    value: output.schedule[key].cost
                  }
                )
              }
            }
            optimalH.sort(ratesSort)
            let totalCost = 0;
            for (let i = 0; i < device.duration; i++) {
              let targetHour = optimalH[i].hour;
              let hourCost = watToKwat(device.power)*optimalH[i].value;
              if (output.schedule[targetHour].powerLimit >= device.power) {
                output.schedule[targetHour].devices.push(device.id)
                output.schedule[targetHour].powerLimit = output.schedule[targetHour].powerLimit - device.power;
                output.consumedEnergy.value = output.consumedEnergy.value + hourCost;
                totalCost = totalCost + hourCost;
              } else {
                console.log('no free grid power');
              }
            }
            output.consumedEnergy.devices[device.id] = totalCost;
          } else {
            console.log(`no mode detected. duration is ${device.duration}`);
            let optimalH = [];
            for (const key in output.schedule) {
                optimalH.push(
                  {
                    hour: key,
                    value: output.schedule[key].cost
                  }
                )
              }
              optimalH.sort(ratesSort)
              let totalCost = 0;
              for (let i = 0; i < device.duration; i++) {
                let targetHour = optimalH[i].hour;
                let hourCost = watToKwat(device.power)*optimalH[i].value;
                if (output.schedule[targetHour].powerLimit >= device.power) {
                  output.schedule[targetHour].devices.push(device.id)
                  output.schedule[targetHour].powerLimit = output.schedule[targetHour].powerLimit - device.power;
                  output.consumedEnergy.value = output.consumedEnergy.value + hourCost;
                  totalCost = totalCost + hourCost
                  
                } else {
                  console.log('no free grid power');
                }
              }
              output.consumedEnergy.devices[device.id] = totalCost;
          }
      }
    );
    output = JSON.stringify(output);
    console.log(output);
    return output
  })
}
smartHouseEnergyCalculator('./data/input.json')
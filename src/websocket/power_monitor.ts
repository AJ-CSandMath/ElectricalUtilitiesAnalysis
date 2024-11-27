import { EventEmitter } from "../deps.ts";

interface PowerReading {
  timestamp: Date;
  power: number;
  voltage: number;
}

export class PowerMonitor extends EventEmitter {
  private interval: number;
  private timer: number | undefined;
  
  constructor(interval = 1000) {
    super();
    this.interval = interval;
  }

  start(): void {
    const id = setInterval(() => {
      const reading: PowerReading = {
        timestamp: new Date(),
        power: Math.random() * 5 + 1,
        voltage: 220 + Math.random() * 10,
      };
      this.emit("reading", reading);
    }, this.interval);
    
    this.timer = id as unknown as number;
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
} 
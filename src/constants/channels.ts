import { WiFiChannel } from '../types';

export const ALL_WIFI_CHANNELS: WiFiChannel[] = [
  {
    id: 1,
    channelNumber: 1,
    label: 'Channel 1',
    frequencyGhz: '2.412 GHz',
    band: '2.4 GHz',
    color: '#DC2626', // Vibrant Red
    lightColor: '#FEE2E2',
    borderColor: '#B91C1C',
    textColor: '#FFFFFF',
  },
  {
    id: 6,
    channelNumber: 6,
    label: 'Channel 6',
    frequencyGhz: '2.437 GHz',
    band: '2.4 GHz',
    color: '#059669', // Emerald Green
    lightColor: '#D1FAE5',
    borderColor: '#047857',
    textColor: '#FFFFFF',
  },
  {
    id: 11,
    channelNumber: 11,
    label: 'Channel 11',
    frequencyGhz: '2.462 GHz',
    band: '2.4 GHz',
    color: '#2563EB', // Royal Blue
    lightColor: '#DBEAFE',
    borderColor: '#1D4ED8',
    textColor: '#FFFFFF',
  },
  {
    id: 36,
    channelNumber: 36,
    label: 'Channel 36',
    frequencyGhz: '5.180 GHz',
    band: '5 GHz',
    color: '#D97706', // Amber Gold
    lightColor: '#FEF3C7',
    borderColor: '#B45309',
    textColor: '#FFFFFF',
  },
  {
    id: 44,
    channelNumber: 44,
    label: 'Channel 44',
    frequencyGhz: '5.220 GHz',
    band: '5 GHz',
    color: '#7C3AED', // Purple Violet
    lightColor: '#EDE9FE',
    borderColor: '#6D28D9',
    textColor: '#FFFFFF',
  },
];

export function getChannelsSubset(count: number): WiFiChannel[] {
  const clamped = Math.max(2, Math.min(count, ALL_WIFI_CHANNELS.length));
  return ALL_WIFI_CHANNELS.slice(0, clamped);
}

export function getChannelByNumber(chNum: number | null): WiFiChannel | undefined {
  if (chNum === null) return undefined;
  return ALL_WIFI_CHANNELS.find((ch) => ch.channelNumber === chNum);
}

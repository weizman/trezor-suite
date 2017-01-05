declare type USBConnectionEvent = {
  device: USBDevice;
};

declare type USBConnectionEventHandler = (event: USBConnectionEvent) => mixed;

declare type BufferSource = ArrayBuffer | DataView | $TypedArray;

declare type USB = {
  onconnect: ?USBConnectionEventHandler;
  ondisconnect: ?USBConnectionEventHandler;
  getDevices: () => Promise<Array<USBDevice>>;
  requestDevice: (options?: USBDeviceRequestOptions) => Promise<USBDevice>;
};

declare type USBDeviceRequestOptions = {
  filters: Array<USBDeviceFilter>;
};

declare type USBDeviceFilter = {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
};

declare type USBDevice = {
  usbVersionMajor: number;
  usbVersionMinor: number;
  usbVersionSubminor: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  vendorId: number;
  productId: number;
  deviceVersionMajor: number;
  deviceVersionMinor: number;
  deviceVersionSubminor: number;
  manufacturerName: ?string;
  productName: ?string;
  serialNumber: ?string;
  configuration: ?USBConfiguration;
  configurations: Array<USBConfiguration>;
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  releaseInterface: (interfaceNumber: number) => Promise<void>;
  selectAlternateInterface: (interfaceNumber: number, alternateSetting: number) => Promise<void>;
  controlTransferIn: (setup: USBControlTransferParameters, length: number) => Promise<USBInTransferResult>;
  controlTransferOut: (setup: USBControlTransferParameters, data?: BufferSource) => Promise<USBOutTransferResult>;
  clearHalt: (direction: USBDirection, endpointNumber: number) => Promise<void>;
  transferIn: (endpointNumber: number, length: number) => Promise<USBInTransferResult>;
  transferOut: (endpointNumber: number, data: BufferSource) => Promise<USBOutTransferResult>;
  isochronousTransferIn: (endpointNumber: number, packetLengths: Array<number>) => Promise<USBIsochronousInTransferResult>;
  isochronousTransferOut: (endpointNumber: number, data: BufferSource, packetLengths: Array<number>) => Promise<USBIsochronousOutTransferResult>;
  reset: () => Promise<void>;
};

declare type USBDirection = 'in' | 'out';

declare type USBConfiguration = {
  configurationValue: number;
  configurationName: ?string;
  interfaces: Array<USBInterface>;
};

declare type USBInterface = {
  interfaceNumber: number;
  alternate: USBAlternateInterface;
  alternates: Array<USBAlternateInterface>;
  claimed: boolean;
};

declare type USBAlternateInterface = {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  interfaceName: ?string;
  endpoints: Array<USBEndpoint>;
};

declare type USBEndpoint = {
  endpointNumber: number;
  direction: USBDirection;
  type: 'bulk' | 'interrupt' |  'isochronous';
  packetSize: number;
};

declare type USBRequestType = 'standard' | 'class' | 'vendor';
declare type USBRecipient = 'device' | 'interface' | 'endpoint' | 'other';

declare type USBControlTransferParameters = {
  requestType: USBRequestType;
  recipient: USBRecipient;
  request: number;
  value: number;
  index: number;
};

declare type USBTransferStatus = 'ok' | 'stall' | 'babble';

declare type USBInTransferResult = {
  data: DataView;
  status: USBTransferStatus;
};

declare type USBOutTransferResult = {
  bytesWritten: number;
  status: USBTransferStatus;
};

declare type USBIsochronousInTransferPacket = {
  data: DataView;
  status: USBTransferStatus;
};

declare type USBIsochronousInTransferResult = {
  data: DataView;
  packets: Array<USBIsochronousInTransferPacket>;
};

declare type USBIsochronousOutTransferPacket = {
  bytesWritten: number;
  status: USBTransferStatus;
};

declare type USBIsochronousOutTransferResult = {
  packets: Array<USBIsochronousOutTransferPacket>;
};

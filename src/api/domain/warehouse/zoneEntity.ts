import mongoose from "mongoose";

 export interface IZone  {
    storehouse: mongoose.Types.ObjectId;
    name: string;
    type: 'storage_zone' | 'picking_zone' | 'loading_dock';
    aisles: mongoose.Types.ObjectId[];
    status?: boolean,
  }
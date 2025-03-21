import Moment from 'moment-timezone';
import {Client, DistanceMatrixResponseData} from '@googlemaps/google-maps-services-js'
import { config } from '../../../../config';
import { info, log } from 'console';

const googleMapsClient = new Client({})
const API_MAP_GOOGLE = config.GOOGLE_MAP_KEY
export class RegionsService {
    isPointInPolygon(lat: number, lng: number, polygon: Array<{ lat: number, lng: number }>): boolean {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].lat, yi = polygon[i].lng;
          const xj = polygon[j].lat, yj = polygon[j].lng;
    
          const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }

      groupOrdersByRegion(orders: any[], regions: any[]): Record<string, any[]> {
        const groupedOrders: any = [];
        
    
        orders.forEach(order => {
          const location = order.deliveryLocation || (order.branch?.location);
          if (!location || !location.lat || !location.lgt) return;
          
          const lat = location.lat;
          const lng = location.lgt;
    
          regions.forEach(region => {
            let isInRegion = false;
    
            if (region.type === 'polygon') {
              isInRegion = this.isPointInPolygon(lat, lng, region.path);
  
            }
    
            if (isInRegion) {
              // if (!groupedOrders[region.name]) {
              //   groupedOrders[region.name] = [];
              // }
              groupedOrders.push(order);
            }
          });
        });
    
        return groupedOrders;
      }
      groupOutOfRegion(orders: any[], regions: any[]): Record<string, any[]> {
        const groupedOrders: any = []; 
        
        orders.forEach(order => {
          // Obtener la ubicación de entrega o la ubicación de la sucursal
          const location = order.deliveryLocation || order.branch?.location;
          if (!location || !location.lat || !location.lgt) return;  // Saltar si no hay ubicación válida
          
          const lat = location.lat;
          const lng = location.lgt;
          
          // Bandera para verificar si el pedido está dentro de alguna región
          let isInAnyRegion = false;
          
          // Revisar cada región
          regions.forEach(region => {
            let isInRegion = false;
            
            // Verificar si el tipo de región es un polígono
            if (region.type === 'polygon') {
              isInRegion = this.isPointInPolygon(lat, lng, region.path); // Verificar si el punto está dentro del polígono   

                         
            }
            
            // Si el pedido está en alguna región, activar la bandera
            if (isInRegion) {
              isInAnyRegion = true;
            }
          });
        
          
          // Si el pedido no está dentro de ninguna región, agregarlo al grupo
          if (!isInAnyRegion) {
            groupedOrders.push(order);
          }
        });
      
        return groupedOrders;
      }
      

      getDistanceMatrix = async (points: any): Promise<any> => {
        const maxWaypoints = 25;
        const origins = points.map((point: any) => `${point.lat},${point.lgt}`);
      
        if (origins.length > maxWaypoints) {
          console.error('Error: Exceeded maximum number of waypoints (25).');
          return null;
        }
      
        try {
          const response = await googleMapsClient.distancematrix({
            params: {
              origins,
              destinations: origins,
              key: API_MAP_GOOGLE,
            },
          });
          
          return response.data;
        } catch (error) {
          console.error('Error fetching distance matrix:', error);
          return null;  // Manejo de errores más claro
        }
      };
      
      calculateDistance = (route: number[], distanceMatrix: DistanceMatrixResponseData): number => {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
          const from = route[i];
          const to = route[i + 1];
      
          // Verificar si hay datos válidos en la matriz de distancias
          if (
            distanceMatrix.rows[from] && 
            distanceMatrix.rows[from].elements[to] && 
            distanceMatrix.rows[from].elements[to].distance
          ) {
            totalDistance += distanceMatrix.rows[from].elements[to].distance.value;
          } else {
            console.error(`No valid distance found between ${from} and ${to}`);
          }
        }
        return totalDistance;
      };
      
      simulatedAnnealingTSP = (distanceMatrix: any): number[] => {
        
        const n = distanceMatrix.rows.length;
        let currentRoute = [...Array(n).keys()];
        let bestRoute = [...currentRoute];
        let currentDistance = this.calculateDistance(currentRoute, distanceMatrix);
        let bestDistance = currentDistance;
      
        const initialTemp = 10000;
        const coolingRate = 0.003;
        let temp = initialTemp;
      
        while (temp > 1) {
          const newRoute = [...currentRoute];
          const i = Math.floor(Math.random() * n);
          const j = (i + Math.floor(Math.random() * (n - 1))) % n;
          [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      
          const newDistance = this.calculateDistance(newRoute, distanceMatrix);
      
          if (newDistance < currentDistance || Math.random() < Math.exp((currentDistance - newDistance) / temp)) {
            currentRoute = [...newRoute];
            currentDistance = newDistance;
      
            if (newDistance < bestDistance) {
              bestRoute = [...newRoute];
              bestDistance = newDistance;
            }
          }
      
          temp *= 1 - coolingRate;
        }
      
        return bestRoute;
      };

      getOptimizedRoute = async (points: any, route: any): Promise<any> => {
        if (!route || route.length < 2) {
          console.error('Invalid route');
          return null;
        }

        // const orderedData = route.map((index: any) => points[index]);        
        const waypointsArray = points.slice(1).map((point: any) => `${point.lat},${point.lgt}`);
        
        // Validación de límite de waypoints
        if (waypointsArray.length > 25) {
          console.error('Error: Exceeded maximum number of waypoints (25).');
          return null;
        }
        
      
        try {

          const response = await googleMapsClient.directions({
            params: {
              origin: `${points[route[0]].lat},${points[route[0]].lgt}`, // Origen
              destination: `${points[route[0]].lat},${points[route[0]].lgt}`, // Destino
              waypoints: waypointsArray, // Waypoints formateados
              key: API_MAP_GOOGLE, // Tu API key
              optimize: true
            },
          });
          const waypointOrder = response.data.routes[0].waypoint_order;

// Reordenar los waypoints originales usando el orden optimizado
      const optimizedWaypoints = waypointOrder.map(index => points[index+1]);
      const legs = response.data.routes[0].legs; 

      legs.forEach((leg: any, index) => {
        if (optimizedWaypoints[index] && optimizedWaypoints[index].order) {
          leg.order = optimizedWaypoints[index].order;
        } else {
          leg.order = null;
        }
      });
      
      // Agrupar legs por start_address y end_address, acumulando `order`
      const groupedLegs = new Map();
      
      legs.forEach((leg: any ) => {
        const key = `${leg.start_address} -> ${leg.end_address}`; // Clave única para identificar duplicados
      
        if (groupedLegs.has(key)) {
          // Si ya existe, acumulamos los valores de `order`
          const existingLeg = groupedLegs.get(key);
          existingLeg.order = `${existingLeg.order}, ${leg.order}`; // Concatenar órdenes
        } else {
          // Si no existe, lo agregamos al mapa
          groupedLegs.set(key, { ...leg });
        }
      });
      // Reemplazar los legs en la respuesta con los agrupados
      response.data.routes[0].legs = Array.from(groupedLegs.values());

          const totalDistance = response.data.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0)
          const TDis = `${ ((totalDistance / 1000).toFixed(2))} Kms`;

          const  totalDuration = response.data.routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0);

          const hours = Math.floor(totalDuration / 3600);
          const minutes = Math.floor((totalDuration % 3600) / 60);
          const Duration = (`${hours} h ${minutes} min`);
          return {info:response.data, waypoints: waypointsArray, totalDistance: TDis, totalDuration: Duration };
        } catch (error) {
          console.error('Error fetching directions:', error);
          return null;  // Manejo de errores más claro
        }
      };
      
      


}
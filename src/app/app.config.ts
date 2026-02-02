import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';

const firebaseConfig = {
  apiKey: "AIzaSyCHn15JRaiA8hx6_GdIog7lrVVjrLhKfxA",
  authDomain: "elyonclothingbrand.firebaseapp.com",
  projectId: "elyonclothingbrand",
  storageBucket: "elyonclothingbrand.firebasestorage.app",
  messagingSenderId: "144060030839",
  appId: "1:144060030839:web:07b8ad878bdea9b765cb72",
  measurementId: "G-D6TBGH3V8F"
};

export const appConfig: ApplicationConfig = {
  providers: [
     provideFirebaseApp(() => initializeApp(firebaseConfig)),
   provideAuth(() => getAuth()),  
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

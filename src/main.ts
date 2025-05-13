import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ModuleRegistry, TextEditorModule, ValidationModule } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
// Register the required modules
ModuleRegistry.registerModules([ClientSideRowModelModule, TextEditorModule, ValidationModule]);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

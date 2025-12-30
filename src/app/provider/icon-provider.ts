import { bootstrapGithub, bootstrapList, bootstrapX } from "@ng-icons/bootstrap-icons";
import { provideIcons } from "@ng-icons/core";


export const provideAppIcon = () =>
    provideIcons({
        bootstrapGithub,
        bootstrapList,
        bootstrapX,
    })
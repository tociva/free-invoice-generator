import { bootstrapGithub, bootstrapList, bootstrapPlusCircleFill, bootstrapTrash, bootstrapTrashFill, bootstrapX } from "@ng-icons/bootstrap-icons";
import { provideIcons } from "@ng-icons/core";


export const provideAppIcon = () =>
    provideIcons({
        bootstrapGithub,
        bootstrapList,
        bootstrapX,
        bootstrapTrashFill,
        bootstrapTrash,
        bootstrapPlusCircleFill
    })
import {
  bootstrapCheckCircleFill,
  bootstrapChevronDoubleLeft,
  bootstrapChevronDoubleRight,
  bootstrapChevronDown,
  bootstrapChevronLeft,
  bootstrapChevronRight,
  bootstrapChevronUp,
  bootstrapCode,
  bootstrapDownload,
  bootstrapEye,
  bootstrapFileCode,
  bootstrapFileEarmarkCode,
  bootstrapFileEarmarkPdfFill,
  bootstrapFileText,
  bootstrapGithub,
  bootstrapList,
  bootstrapMoon,
  bootstrapPlusCircleFill,
  bootstrapPrinter,
  bootstrapSearch,
  bootstrapSun,
  bootstrapTrash,
  bootstrapTrashFill,
  bootstrapX,
} from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { createTngIconPack, provideTngIcons } from '@tailng-ui/icons/core';

export const provideAppThemeIcons = () =>
  provideTngIcons({
    defaultPack: 'bootstrap',
    packs: [createTngIconPack('bootstrap', { sun: bootstrapSun, moon: bootstrapMoon })],
  });

export const provideAppIcon = () =>
  provideIcons({
    bootstrapGithub,
    bootstrapList,
    bootstrapX,
    bootstrapTrashFill,
    bootstrapTrash,
    bootstrapPlusCircleFill,
    bootstrapChevronUp,
    bootstrapChevronDown,
    bootstrapCheckCircleFill,
    bootstrapChevronRight,
    bootstrapChevronLeft,
    bootstrapPrinter,
    bootstrapFileEarmarkPdfFill,
    bootstrapFileEarmarkCode,
    bootstrapCode,
    bootstrapFileCode,
    bootstrapFileText,
    bootstrapSearch,
    bootstrapChevronDoubleLeft,
    bootstrapChevronDoubleRight,
    bootstrapDownload,
    bootstrapEye,
  });

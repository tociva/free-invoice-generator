export const displayAutoCompleteWithName = (params: {name: string}) => {
    if(!params) {return '';}
    return params.name;
};
export const isMobile = (): boolean => {
    return window.innerWidth <= 600;
};
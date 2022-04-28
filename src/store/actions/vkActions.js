import bridge from "@vkontakte/vk-bridge";
export const initApp = () => async(dispatch) => {
  try {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type === "VKWebAppUpdateConfig") {
        const schemeAttribute = document.createAttribute("scheme");
        schemeAttribute.value = data.scheme ? data.scheme : "client_light";
        //document.body.attributes.setNamedItem(schemeAttribute);
      }
    });
   
  } catch {
  }
};

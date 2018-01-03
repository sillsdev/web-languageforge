export class TranslateUtilities {

  static sliderColor(confidenceThreshold: number) {
    const opacity = TranslateUtilities.suggestionStyle(confidenceThreshold).opacity;
    return 'rgba(0, 102, 204, ' + opacity + ')';
  }

  static suggestionStyle(confidenceThreshold: number) {
    const maxOpacity = 1;
    const minOpacity = 0.3;
    const opacity = (confidenceThreshold * (maxOpacity - minOpacity)) + minOpacity;
    return { opacity };
  }

}

// plotly.js-dist-min — уже собранный бандл (с gl3d для surface/scatter3d),
// поэтому react-plotly.js подключается через фабрику, а не готовый default-экспорт
import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

export const Plot = createPlotlyComponent(Plotly);

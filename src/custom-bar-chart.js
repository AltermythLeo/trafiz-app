import React from "react";
import { View } from "react-native";
import { Svg, Rect, G, Line, Text} from "react-native-svg";
import AbstractChart from "react-native-chart-kit/src/abstract-chart";

const barWidth = 32;

class CustomBarChart extends AbstractChart {
  getBarPercentage = () => {
    const { barPercentage = 1 } = this.props.chartConfig;
    return barPercentage;
  };
  
  calcScaler = data => {
    if (this.props.fromZero) {
      const min = Math.min(...data, 0);
      const max = Math.max(...data, 0);
      if(max > Math.abs(min))
        return max * 2;
      else
        return Math.abs(min) * 2;
//      return Math.max(...data, 0) - Math.min(...data, 0) || 1;
    } else {
      return Math.max(...data) - Math.min(...data) || 1;
    }
  };

  calcBaseHeight2 = (data, height) => {
    if(this.props.fromZero)
    {
      const min = Math.min(...data);
      const max = Math.max(...data);
      if (max > Math.abs(min)) {
        console.warn('exitA');
        return (height * max) / this.calcScaler(data);
      } else if (max == Math.abs(min)) {
        console.warn('exitB ' + height);
        return (height * max) / this.calcScaler(data);
//        return height;
      } else {
        console.warn('exit2');
        return (height * Math.abs(min)) / this.calcScaler(data);
      }
    }
    else
    {
      const min = Math.min(...data);
      const max = Math.max(...data);
      if (min >= 0 && max >= 0) {
        console.warn('exit3');
        return height;
      } else if (min < 0 && max <= 0) {
        console.warn('exit4');
        return 0;
      } else if (min < 0 && max > 0) {
        console.warn('exit5');
        return (height * max) / this.calcScaler(data);
      }
    }
  };

  renderBars = config => {
    const { data, width, height, paddingTop, paddingRight } = config;
    const baseHeight = this.calcBaseHeight2(data, height);
    return data.map((x, i) => {
      const barHeight = this.calcHeight(x, data, height);
      const barWidth = 32 * this.getBarPercentage();
      return (
        <Rect
          key={Math.random()}
          x={
            paddingRight +
            (i * (width - paddingRight)) / data.length +
            barWidth / 2
          }
          y={
            ((barHeight > 0 ? baseHeight - barHeight : baseHeight) / 5) * 4 +
            paddingTop
          }
          width={barWidth}
          height={(Math.abs(barHeight) / 5) * 4}
          fill={this.props.chartConfig.colors[i%this.props.chartConfig.colors.length]}
        />
      );
    });
  };

  renderHorizontalLabels = config => {
    const {
      count,
      data,
      height,
      paddingTop,
      paddingRight,
      horizontalLabelRotation = 0
    } = config;
    const { yAxisLabel = "", yAxisSuffix = "", yLabelsOffset = 12, chartConfig } = this.props;
    const { decimalPlaces = 2 } = chartConfig;
    const max = this.props.fromZero ? Math.max(...data, 0) : Math.max(...data);
    const min = this.props.fromZero ? Math.min(...data, 0) : Math.min(...data);
    let   arr;
    if(this.props.fromZero)
    {
      if(max > -min)
        arr = [-max, -max / 2, 0, max/2, max];
      else
        arr = [min, min / 2, 0, -min/2, -min];
    }else
    {
      if(max > min)
        arr = [0, max/4, max/2, max * 3/4, max];
      else
        arr = [0, min/4, -min/2, -min * 3/4, -min];
    }
    return [...new Array(count)].map((_, i) => {
      let yLabel;
      if (count === 1) {
        yLabel = `${yAxisLabel}${data[0].toFixed(decimalPlaces)}${yAxisSuffix}`;
      } else {
        const label = arr[i];
        yLabel = `${yAxisLabel}${label.toFixed(decimalPlaces)}${yAxisSuffix}`;
      }

      const x = paddingRight - yLabelsOffset;
      const y = count === 1 && this.props.fromZero
          ? paddingTop + 4
          : (height * 3) / 4 - ((height) / count) * i + 30;
      return (
        <Text
          rotation={horizontalLabelRotation}
          origin={`${x}, ${y}`}
          key={Math.random()}
          x={x}
          textAnchor="end"
          y={y}
          {...this.getPropsForLabels()}
        >
          {yLabel}
        </Text>
      );
    });
  };

  renderVerticalLine = config => {
    const { height, paddingTop, paddingRight } = config;
    return (
      <Line
        key={Math.random()}
        x1={Math.floor(paddingRight)}
        y1={0}
        x2={Math.floor(paddingRight)}
        y2={height - height / 5 + paddingTop}
        {...this.getPropsForBackgroundLines()}
      />
    );
  };

  renderHorizontalLines2 = config => {
    const { count, width, height, paddingTop, paddingRight } = config;
    return [...new Array(count)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={paddingRight}
          y1={(height / 5) * i + paddingTop}
          x2={width}
          y2={(height / 5) * i + paddingTop}
          {...this.getPropsForBackgroundLines()}
          stroke={(this.props.fromZero && i == 2) || (!this.props.fromZero && i == 4) ? 'black' : 'gainsboro'}
        />
      );
    });
  };

  render() {
    const {
      width,
      height,
      data,
      style = {},
      withHorizontalLabels = true,
      withVerticalLabels = true,
      verticalLabelRotation = 0,
      horizontalLabelRotation = 0,
      withInnerLines = true
    } = this.props;
    const { borderRadius = 0, paddingTop = 16, paddingRight = 64 } = style;
    const config = {
      width,
      height,
      verticalLabelRotation,
      horizontalLabelRotation
    };
    return (
      <View style={style}>
        <Svg height={height} width={width}>
          {this.renderDefs({
            ...config,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"
          />
          <G>
            {
              this.renderVerticalLine({
                  height,
                  paddingTop,
                  paddingRight})
            }
          </G>
          <G>
            {withInnerLines
              ?  this.renderHorizontalLines2({
                  ...config,
                  count: 5,
                  color:'grey',
                  paddingTop,
                  paddingRight
                })
              : null}
          </G>
          <G>
            {withHorizontalLabels
              ? this.renderHorizontalLabels({
                  ...config,
                  count: 5,
                  data: data.datasets[0].data,
                  paddingTop,
                  paddingRight
                })
              : null}
          </G>
          <G>
            {withVerticalLabels
              ? this.renderVerticalLabels({
                  ...config,
                  labels: data.labels,
                  paddingRight,
                  paddingTop,
                  horizontalOffset: barWidth * this.getBarPercentage()
                })
              : null}
          </G>
          <G>
            {this.renderBars({
              ...config,
              data: data.datasets[0].data,
              paddingTop,
              paddingRight
            })}
          </G>
        </Svg>
      </View>
    );
  }
}

export default CustomBarChart;

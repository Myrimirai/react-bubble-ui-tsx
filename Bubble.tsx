import React, {
  useRef,
  useState,
  useLayoutEffect,
  UIEvent,
  ReactNode,
  CSSProperties,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./Bubble.module.css";

export interface BubbleOptions {
  size?: number;
  minSize?: number;
  gutter?: number;
  provideProps?: boolean;
  numCols?: number;
  fringeWidth?: number;
  yRadius?: number;
  xRadius?: number;
  cornerRadius?: number;
  showGuides?: boolean;
  compact?: boolean;
  gravitation?: number;
  shape?: "ellipse" | "rectangle";
}

export const defaultOptions: BubbleOptions = {
  size: 200,
  minSize: 20,
  gutter: 16,
  provideProps: false,
  numCols: 6,
  fringeWidth: 100,
  yRadius: 200,
  xRadius: 200,
  cornerRadius: 100,
  showGuides: false,
  compact: false,
  gravitation: 0,
  shape: "ellipse",
};

interface BubbleUIProps {
  children: ReactNode;
  options?: BubbleOptions;
  className?: string;
  style?: CSSProperties;
}

interface BubbleProperties {
  bubbleSize: number;
  translateX: number;
  translateY: number;
  distance: number;
}

const Bubble = forwardRef<HTMLDivElement, BubbleUIProps>(
  ({ children, options: propOptions, className, style }, ref) => {
    if (!children) {
      return null;
    }

    const options: BubbleOptions = { ...defaultOptions, ...propOptions };

    const childArray = React.Children.toArray(children);
    options.numCols = Math.min(options.numCols ?? 0, childArray.length);

    const minProportion = (options.minSize ?? 0) / (options.size ?? 1);
    const verticalPadding = `calc(50% - ${
      (options.yRadius ?? 0) +
      (options.size ?? 0) / 2 -
      ((options.cornerRadius ?? 0) * (1.414 - 1)) / 1.414
    }px)`;
    const horizontalPadding = `calc(50% - ${
      (options.xRadius ?? 0) +
      (options.size ?? 0) / 2 -
      ((options.cornerRadius ?? 0) * (1.414 - 1)) / 1.414
    }px)`;

    const scrollableRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => scrollableRef.current as HTMLDivElement);

    const rows: ReactNode[][] = [];
    let colsRemaining = 0;
    let evenRow = true;

    for (let i = 0; i < childArray.length; i++) {
      if (colsRemaining === 0) {
        colsRemaining = evenRow
          ? (options.numCols ?? 0) - 1
          : (options.numCols ?? 0);
        evenRow = !evenRow;
        rows.push([]);
      }
      rows[rows.length - 1].push(childArray[i]);
      colsRemaining--;
    }

    if (rows.length > 1) {
      const lastRow = rows[rows.length - 1];
      const secondLastRow = rows[rows.length - 2];
      if (lastRow.length % 2 === secondLastRow.length % 2) {
        lastRow.push(<div key="dummy"></div>);
      }
    }

    const [scrollTop, setScrollTop] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
      setScrollLeft(e.currentTarget.scrollLeft);
    };

    useLayoutEffect(() => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTo(
          (scrollableRef.current.scrollWidth -
            scrollableRef.current.clientWidth) /
            2,
          (scrollableRef.current.scrollHeight -
            scrollableRef.current.clientHeight) /
            2,
        );
      }
    }, []);

    const interpolate = (
      actualMin: number,
      actualMax: number,
      val: number,
      targetMin: number,
      targetMax: number,
    ) => {
      if (actualMax - actualMin === 0) return targetMin;
      return (
        ((val - actualMin) / (actualMax - actualMin)) *
          (targetMax - targetMin) +
        targetMin
      );
    };

    const getBubbleSize = (row: number, col: number): BubbleProperties => {
      const size = options.size ?? 0;
      const gutter = options.gutter ?? 0;
      const cornerRadius = options.cornerRadius ?? 0;
      const yRadius = options.yRadius ?? 0;
      const xRadius = options.xRadius ?? 0;
      const numCols = options.numCols ?? 0;

      const yOffset =
        (size + gutter) * 0.866 * row -
        size +
        (cornerRadius * (1.414 - 1)) / 1.414 -
        (yRadius - size);
      const xOffset =
        (size + gutter) * col +
        ((numCols - rows[row].length) * (size + gutter)) / 2 -
        size +
        (cornerRadius * (1.414 - 1)) / 1.414 -
        (xRadius - size);

      const dy = yOffset - scrollTop;
      const dx = xOffset - scrollLeft;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let bubbleProperties: BubbleProperties = {
        bubbleSize: 1,
        translateX: 0,
        translateY: 0,
        distance: distance,
      };
      let distanceFromEdge = 0;
      let isInCornerRegion = false;

      const fringeWidth = options.fringeWidth ?? 0;

      if (Math.abs(dx) <= xRadius && Math.abs(dy) <= yRadius) {
        if (
          Math.abs(dy) > yRadius - cornerRadius &&
          Math.abs(dx) > xRadius - cornerRadius
        ) {
          const distToInnerCorner = Math.sqrt(
            Math.pow(Math.abs(dy) - yRadius + cornerRadius, 2) +
              Math.pow(Math.abs(dx) - xRadius + cornerRadius, 2),
          );
          if (distToInnerCorner > cornerRadius) {
            distanceFromEdge = distToInnerCorner - cornerRadius;
            isInCornerRegion = true;
          }
        }
      } else if (
        Math.abs(dx) <= xRadius + fringeWidth &&
        Math.abs(dy) <= yRadius + fringeWidth
      ) {
        if (
          Math.abs(dy) > yRadius - cornerRadius &&
          Math.abs(dx) > xRadius - cornerRadius
        ) {
          isInCornerRegion = true;
          const distToInnerCorner = Math.sqrt(
            Math.pow(Math.abs(dy) - yRadius + cornerRadius, 2) +
              Math.pow(Math.abs(dx) - xRadius + cornerRadius, 2),
          );
          distanceFromEdge = distToInnerCorner - cornerRadius;
        } else {
          distanceFromEdge = Math.max(
            Math.abs(dx) - xRadius,
            Math.abs(dy) - yRadius,
          );
        }
      } else {
        isInCornerRegion =
          Math.abs(dy) > yRadius - cornerRadius &&
          Math.abs(dx) > xRadius - cornerRadius;
        if (isInCornerRegion) {
          const distToInnerCorner = Math.sqrt(
            Math.pow(Math.abs(dy) - yRadius + cornerRadius, 2) +
              Math.pow(Math.abs(dx) - xRadius + cornerRadius, 2),
          );
          distanceFromEdge = distToInnerCorner - cornerRadius;
        } else {
          distanceFromEdge = Math.max(
            Math.abs(dx) - xRadius,
            Math.abs(dy) - yRadius,
          );
        }
      }

      bubbleProperties.bubbleSize = interpolate(
        0,
        fringeWidth,
        Math.min(distanceFromEdge, fringeWidth),
        1,
        minProportion,
      );

      const translationMag = options.compact
        ? (size - (options.minSize ?? 0)) / 2
        : 0;
      const interpolatedTranslationMag = interpolate(
        0,
        fringeWidth,
        distanceFromEdge,
        0,
        translationMag,
      );

      if (distanceFromEdge > 0 && distanceFromEdge <= fringeWidth) {
        bubbleProperties.translateX = interpolatedTranslationMag;
        bubbleProperties.translateY = interpolatedTranslationMag;
      } else if (distanceFromEdge - fringeWidth > 0) {
        const extra =
          (Math.max(0, distanceFromEdge - fringeWidth - size / 2) *
            (options.gravitation ?? 0)) /
          10;
        bubbleProperties.translateX = translationMag + extra;
        bubbleProperties.translateY = translationMag + extra;
      }

      if (isInCornerRegion) {
        const cornerDx = Math.abs(dx) - xRadius + cornerRadius;
        const cornerDy = Math.abs(dy) - yRadius + cornerRadius;
        let theta = Math.atan(-cornerDy / cornerDx);

        if (dx > 0) {
          if (dy > 0) {
            theta *= -1;
          }
        } else {
          if (dy > 0) {
            theta += Math.PI;
          } else {
            theta += Math.PI - 2 * theta;
          }
        }

        bubbleProperties.translateX *= -Math.cos(theta);
        bubbleProperties.translateY *= -Math.sin(theta);
      } else if (Math.abs(dx) > xRadius || Math.abs(dy) > yRadius) {
        if (Math.abs(dx) > xRadius) {
          bubbleProperties.translateX *= -Math.sign(dx);
          bubbleProperties.translateY = 0;
        } else {
          bubbleProperties.translateY *= -Math.sign(dy);
          bubbleProperties.translateX = 0;
        }
      }

      return bubbleProperties;
    };

    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...style,
        }}
      >
        <div className={styles.container}>
          <div
            className={styles.scrollable}
            ref={scrollableRef}
            onScroll={handleScroll}
          >
            <div
              className={styles.horizontalSpacer}
              style={{
                height: verticalPadding,
              }}
            ></div>
            <div
              className={styles.rowContainer}
              style={{
                width:
                  (options.size ?? 0) * (options.numCols ?? 0) +
                  (options.gutter ?? 0) * ((options.numCols ?? 0) - 1),
                paddingLeft: horizontalPadding,
                paddingRight: horizontalPadding,
              }}
            >
              {rows.map((row, i) => (
                <div
                  className={styles.row}
                  key={i}
                  style={{
                    marginTop:
                      i > 0
                        ? (options.size ?? 0) * -0.134 +
                          (options.gutter ?? 0) * 0.866
                        : 0,
                  }}
                >
                  {row.map((comp, j) => {
                    const { bubbleSize, translateX, translateY, distance } =
                      getBubbleSize(i, j);

                    const transformStyle = `translateX(${translateX}px) translateY(${translateY}px) scale(${bubbleSize})`;

                    return (
                      <div
                        key={j}
                        className={styles.bubbleContainer}
                        style={{
                          width: options.size,
                          height: options.size,
                          marginRight: (options.gutter ?? 0) / 2,
                          marginLeft: (options.gutter ?? 0) / 2,
                          transform: transformStyle,
                          transition: "transform 0.3s",
                        }}
                      >
                        {options.provideProps &&
                        React.isValidElement(comp) &&
                        typeof comp.type !== "string"
                          ? React.cloneElement(comp as React.ReactElement, {
                              bubbleSize: bubbleSize * (options.size ?? 0),
                              distanceToCenter: distance,
                              maxSize: options.size,
                              minSize: options.minSize,
                            })
                          : comp}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div
              className={styles.horizontalSpacer}
              style={{
                height: verticalPadding,
              }}
            ></div>
          </div>

          {options.showGuides && (
            <div className={styles.guideContainer}>
              <div
                className={styles.guide}
                style={{
                  height: (options.yRadius ?? 0) * 2,
                  width: (options.xRadius ?? 0) * 2,
                  borderRadius:
                    options.shape === "ellipse" ? "50%" : options.cornerRadius,
                }}
              ></div>
              <div
                className={styles.guide}
                style={{
                  height:
                    ((options.yRadius ?? 0) + (options.fringeWidth ?? 0)) * 2,
                  width:
                    ((options.xRadius ?? 0) + (options.fringeWidth ?? 0)) * 2,
                  borderRadius:
                    options.shape === "ellipse"
                      ? "50%"
                      : (options.cornerRadius ?? 0) +
                        (options.fringeWidth ?? 0),
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default Bubble;

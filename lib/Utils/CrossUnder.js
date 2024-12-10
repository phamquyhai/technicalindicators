import { Indicator, IndicatorInput } from '../indicator/indicator';
import { CrossDown } from './CrossDown';
export class CrossInput extends IndicatorInput {
    constructor(lineA, lineB) {
        super();
        this.lineA = lineA;
        this.lineB = lineB;
    }
}
export class CrossUnder extends Indicator {
    constructor(input) {
        super(input);
        var crossDown = new CrossDown({ lineA: input.lineA, lineB: input.lineB });
        const genFn = (function* () {
            var current = yield;
            var result = false;
            var first = true;
            while (true) {
                var nextDown = crossDown.nextValue(current.valueA, current.valueB);
                result = !!nextDown;
                if (first)
                    result = false;
                first = false;
                current = yield result;
            }
        });
        this.generator = genFn();
        this.generator.next();
        this.result = crossDown.getResult().map((down, index) => {
            if (index === 0)
                return false;
            return !!down;
        });
    }
    static reverseInputs(input) {
        if (input.reversedInput) {
            input.lineA ? input.lineA.reverse() : undefined;
            input.lineB ? input.lineB.reverse() : undefined;
        }
    }
    nextValue(valueA, valueB) {
        return this.generator.next({
            valueA: valueA,
            valueB: valueB
        }).value;
    }
}
CrossUnder.calculate = crossUnder;
export function crossUnder(input) {
    Indicator.reverseInputs(input);
    var result = new CrossUnder(input).result;
    if (input.reversedInput) {
        result.reverse();
    }
    Indicator.reverseInputs(input);
    return result;
}

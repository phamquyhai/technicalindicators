import { Indicator, IndicatorInput } from '../indicator/indicator';
import { CrossDown } from './CrossDown';

export class CrossInput extends IndicatorInput {
    constructor(public lineA: number[], public lineB: number[]) {
        super();
    }
}

export class CrossUnder extends Indicator {
    generator: IterableIterator<true | false>;
    result: boolean[];

    constructor(input: CrossInput) {
        super(input);

        var crossDown = new CrossDown({ lineA: input.lineA, lineB: input.lineB });

        const genFn = (function* (): IterableIterator<true | false> {
            var current = yield;
            var result = false;
            var first = true;

            while (true) {
                var nextDown = crossDown.nextValue(current.valueA, current.valueB);

                result = !!nextDown;

                if (first) result = false;
                first = false;
                current = yield result;
            }
        });

        this.generator = genFn();
        this.generator.next();

        this.result = crossDown.getResult().map((down, index) => {
            if (index === 0) return false;
            return !!down;
        });
    }

    static calculate = crossUnder;

    static reverseInputs(input: CrossInput): void {
        if (input.reversedInput) {
            input.lineA ? input.lineA.reverse() : undefined;
            input.lineB ? input.lineB.reverse() : undefined;
        }
    }

    nextValue(valueA: number, valueB: number): true | false {
        return this.generator.next({
            valueA: valueA,
            valueB: valueB
        }).value;
    }
}

export function crossUnder(input: CrossInput): boolean[] {
    Indicator.reverseInputs(input);
    var result = new CrossUnder(input).result;
    if (input.reversedInput) {
        result.reverse();
    }
    Indicator.reverseInputs(input);
    return result;
}
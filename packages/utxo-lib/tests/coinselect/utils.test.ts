import { bignumberOrNaN, getFee, transactionBytes } from '../../src/coinselect/utils';

describe('coinselect utils', () => {
    it('bignumberOrNaN', () => {
        expect(bignumberOrNaN('1')).not.toBeUndefined();
        expect(bignumberOrNaN('1.1')).toBeUndefined();
        expect(bignumberOrNaN('-1')).toBeUndefined();
        expect(bignumberOrNaN('')).toBeUndefined();
        expect(bignumberOrNaN('deadbeef')).toBeUndefined();
        expect(bignumberOrNaN('0x dead beef')).toBeUndefined();
        expect(bignumberOrNaN('1.1')).toBeUndefined();
        expect(bignumberOrNaN()).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(1)).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(-1, true)).not.toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(Infinity)).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(NaN)).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(1.1)).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN(-1)).toBeUndefined();
        // @ts-expect-error invalid arg
        expect(bignumberOrNaN({})).toBeUndefined();
    });

    it('getBaseFee', () => {
        expect(getFee(1.33, 56, {}, [])).toEqual(75);
        expect(getFee(1, 100, {}, [])).toEqual(100);
        expect(getFee(1, 200, {}, [])).toEqual(200);
        // without floor
        expect(getFee(1, 200, { baseFee: 1000 }, [])).toEqual(1200);
        expect(
            getFee(
                2,
                127,
                {
                    baseFee: 1000,
                    dustOutputFee: 1000,
                    dustThreshold: 9,
                },
                [
                    { value: '8', script: { length: 0 } },
                    { value: '7', script: { length: 0 } },
                ],
            ),
        ).toEqual(3254);

        // with floor
        expect(getFee(1, 200, { baseFee: 1000, floorBaseFee: true }, [])).toEqual(1000);
        expect(
            getFee(
                2,
                1000,
                {
                    baseFee: 1000,
                    dustOutputFee: 1000,
                    dustThreshold: 9,
                    floorBaseFee: true,
                },
                [
                    { value: '8', script: { length: 0 } },
                    { value: '7', script: { length: 0 } },
                ],
            ),
        ).toEqual(5000);
    });

    it('transactionBytes', () => {
        expect(
            transactionBytes(
                // TODO: commented values are in fact consumed by transactionWeight but are not
                // allowed by types. should we do something about it?
                [
                    {
                        // coinbase: false,
                        // confirmations: 1,
                        // i: 0,
                        // own: true,
                        // required: undefined,
                        script: {
                            length: 107,
                        },
                        type: 'p2wpkh',
                        // value: '200000',
                        weight: 272,
                    },
                ],
                [
                    {
                        script: {
                            length: 22,
                        },
                        // value: '181124',
                        weight: 124,
                    },
                ],
            ),
        ).toEqual(110);
    });
});

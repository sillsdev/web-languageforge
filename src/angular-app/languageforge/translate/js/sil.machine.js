/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2016
 * @compiler Bridge.NET 16.0.0-rc
 */
Bridge.assembly("SIL.Machine", function ($asm, globals) {
    "use strict";

    Bridge.define("SIL.Machine.Annotations.SpanFactory$1", function (TOffset) { return {
        fields: {
            _includeEndpoint: false,
            _comparer: null,
            _equalityComparer: null
        },
        props: {
            includeEndpoint: {
                get: function () {
                    return this._includeEndpoint;
                }
            },
            comparer: {
                get: function () {
                    return this._comparer;
                }
            },
            equalityComparer: {
                get: function () {
                    return this._equalityComparer;
                }
            }
        },
        ctors: {
            ctor: function () {
                SIL.Machine.Annotations.SpanFactory$1(TOffset).$ctor1.call(this, false);
            },
            $ctor1: function (includeEndpoint) {
                SIL.Machine.Annotations.SpanFactory$1(TOffset).$ctor2.call(this, includeEndpoint, new (System.Collections.Generic.Comparer$1(TOffset))(System.Collections.Generic.Comparer$1.$default.fn), System.Collections.Generic.EqualityComparer$1(TOffset).def);
            },
            $ctor2: function (includeEndpoint, comparer, equalityComparer) {
                this.$initialize();
                this._includeEndpoint = includeEndpoint;
                this._comparer = comparer;
                this._equalityComparer = equalityComparer;
            }
        },
        methods: {
            calcLength$1: function (start, end, dir) {
                var actualStart;
                var actualEnd;
                if (dir === SIL.Machine.DataStructures.Direction.leftToRight) {
                    actualStart = start;
                    actualEnd = end;
                } else {
                    actualStart = end;
                    actualEnd = start;
                }

                return this.calcLength(actualStart, actualEnd);
            },
            isValidSpan: function (start, end) {
                return this.isValidSpan$1(start, end, SIL.Machine.DataStructures.Direction.leftToRight);
            },
            isValidSpan$1: function (start, end, dir) {
                var actualStart;
                var actualEnd;
                if (dir === SIL.Machine.DataStructures.Direction.leftToRight) {
                    actualStart = start;
                    actualEnd = end;
                } else {
                    actualStart = end;
                    actualEnd = start;
                }

                var compare = this._comparer[Bridge.geti(this._comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](actualStart, actualEnd);
                return this._includeEndpoint ? compare <= 0 : compare < 0;
            },
            isRange$1: function (start, end, dir) {
                var actualStart;
                var actualEnd;
                if (dir === SIL.Machine.DataStructures.Direction.leftToRight) {
                    actualStart = start;
                    actualEnd = end;
                } else {
                    actualStart = end;
                    actualEnd = start;
                }

                return this.isRange(actualStart, actualEnd);
            },
            create$1: function (start, end) {
                return this.create$2(start, end, SIL.Machine.DataStructures.Direction.leftToRight);
            },
            create$2: function (start, end, dir) {
                var actualStart;
                var actualEnd;
                if (dir === SIL.Machine.DataStructures.Direction.leftToRight) {
                    actualStart = start;
                    actualEnd = end;
                } else {
                    actualStart = end;
                    actualEnd = start;
                }

                if (!this.isValidSpan(actualStart, actualEnd)) {
                    throw new System.ArgumentException("The start offset is greater than the end offset.", "start");
                }

                return new (SIL.Machine.Annotations.Span$1(TOffset)).$ctor2(this, actualStart, actualEnd);
            },
            create: function (offset) {
                return this.create$3(offset, SIL.Machine.DataStructures.Direction.leftToRight);
            }
        }
    }; });

    Bridge.define("SIL.Machine.Annotations.Span$1", function (TOffset) { return {
        inherits: function () { return [System.IComparable$1(SIL.Machine.Annotations.Span$1(TOffset)),System.IComparable,System.IEquatable$1(SIL.Machine.Annotations.Span$1(TOffset))]; },
        $kind: "struct",
        statics: {
            methods: {
                op_Equality: function (x, y) {
                    return x.equalsT(y);
                },
                op_Inequality: function (x, y) {
                    return !(SIL.Machine.Annotations.Span$1(TOffset).op_Equality(x, y));
                },
                getDefaultValue: function () { return new (SIL.Machine.Annotations.Span$1(TOffset))(); }
            }
        },
        fields: {
            _spanFactory: null,
            _start: Bridge.getDefaultValue(TOffset),
            _end: Bridge.getDefaultValue(TOffset)
        },
        props: {
            spanFactory: {
                get: function () {
                    return this._spanFactory;
                }
            },
            isEmpty: {
                get: function () {
                    return SIL.Machine.Annotations.Span$1(TOffset).op_Equality(this._spanFactory.empty, this);
                }
            },
            start: {
                get: function () {
                    return this._start;
                }
            },
            end: {
                get: function () {
                    return this._end;
                }
            },
            length: {
                get: function () {
                    return this._spanFactory.calcLength(this._start, this._end);
                }
            },
            isRange: {
                get: function () {
                    return this._spanFactory.isRange(this._start, this._end);
                }
            }
        },
        alias: [
            "compareTo", ["System$IComparable$1$SIL$Machine$Annotations$Span$1$" + Bridge.getTypeAlias(TOffset) + "$compareTo", "System$IComparable$1$compareTo"],
            "compareTo$1", "System$IComparable$compareTo",
            "equalsT", "System$IEquatable$1$SIL$Machine$Annotations$Span$1$" + Bridge.getTypeAlias(TOffset) + "$equalsT"
        ],
        ctors: {
            $ctor2: function (spanFactory, start, end) {
                this.$initialize();
                this._spanFactory = spanFactory;
                this._start = start;
                this._end = end;
            },
            $ctor1: function (span) {
                SIL.Machine.Annotations.Span$1(TOffset).$ctor2.call(this, span._spanFactory, span._start, span._end);
            },
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getStart: function (dir) {
                return dir === SIL.Machine.DataStructures.Direction.leftToRight ? this._start : this._end;
            },
            getEnd: function (dir) {
                return dir === SIL.Machine.DataStructures.Direction.leftToRight ? this._end : this._start;
            },
            overlaps$2: function (other) {
                return (this._spanFactory.includeEndpoint ? this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._start, other._end) <= 0 : this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._start, other._end) < 0) && (this._spanFactory.includeEndpoint ? this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._end, other._start) >= 0 : this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._end, other._start) > 0);
            },
            overlaps: function (start, end) {
                return this.overlaps$1(start, end, SIL.Machine.DataStructures.Direction.leftToRight);
            },
            overlaps$1: function (start, end, dir) {
                return this.overlaps$2(this._spanFactory.create$2(start, end, dir));
            },
            contains$4: function (other) {
                return this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._start, other._start) <= 0 && this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._end, other._end) >= 0;
            },
            contains: function (offset) {
                return this.contains$3(offset, SIL.Machine.DataStructures.Direction.leftToRight);
            },
            contains$3: function (offset, dir) {
                return this.contains$4(this._spanFactory.create$3(offset, dir));
            },
            contains$1: function (start, end) {
                return this.contains$2(start, end, SIL.Machine.DataStructures.Direction.leftToRight);
            },
            contains$2: function (start, end, dir) {
                return this.contains$4(this._spanFactory.create$2(start, end, dir));
            },
            compareTo: function (other) {
                var res = this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._start, other._start);
                if (res === 0) {
                    res = (-this._spanFactory.comparer[Bridge.geti(this._spanFactory.comparer, "System$Collections$Generic$IComparer$1$" + Bridge.getTypeAlias(TOffset) + "$compare", "System$Collections$Generic$IComparer$1$compare")](this._end, other._end)) | 0;
                }
                return res;
            },
            compareTo$1: function (other) {
                if (!(Bridge.is(other, SIL.Machine.Annotations.Span$1(TOffset)))) {
                    throw new System.ArgumentException();
                }
                return this.compareTo(System.Nullable.getValue(Bridge.cast(Bridge.unbox(other), SIL.Machine.Annotations.Span$1(TOffset))));
            },
            getHashCode: function () {
                var code = 23;
                code = (Bridge.Int.mul(code, 31) + (this._start == null ? 0 : this._spanFactory.equalityComparer[Bridge.geti(this._spanFactory.equalityComparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2")](this._start))) | 0;
                code = (Bridge.Int.mul(code, 31) + (this._end == null ? 0 : this._spanFactory.equalityComparer[Bridge.geti(this._spanFactory.equalityComparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$getHashCode2", "System$Collections$Generic$IEqualityComparer$1$getHashCode2")](this._end))) | 0;
                return code;
            },
            equals: function (obj) {
                return Bridge.is(obj, SIL.Machine.Annotations.Span$1(TOffset)) && this.equalsT(System.Nullable.getValue(Bridge.cast(Bridge.unbox(obj), SIL.Machine.Annotations.Span$1(TOffset))));
            },
            equalsT: function (other) {
                return this._spanFactory.equalityComparer[Bridge.geti(this._spanFactory.equalityComparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2")](this._start, other._start) && this._spanFactory.equalityComparer[Bridge.geti(this._spanFactory.equalityComparer, "System$Collections$Generic$IEqualityComparer$1$" + Bridge.getTypeAlias(TOffset) + "$equals2", "System$Collections$Generic$IEqualityComparer$1$equals2")](this._end, other._end);
            },
            toString: function () {
                return System.String.format("[{0}, {1}]", this._start, this._end);
            },
            $clone: function (to) {
                var s = to || new (SIL.Machine.Annotations.Span$1(TOffset))();
                s._spanFactory = this._spanFactory;
                s._start = this._start;
                s._end = this._end;
                return s;
            }
        }
    }; });

    Bridge.define("SIL.Machine.DataStructures.Direction", {
        $kind: "enum",
        statics: {
            fields: {
                leftToRight: 0,
                rightToLeft: 1
            }
        }
    });

    Bridge.define("SIL.Machine.Tokenization.DetokenizeOperation", {
        $kind: "enum",
        statics: {
            fields: {
                noOperation: 0,
                mergeLeft: 1,
                mergeRight: 2,
                mergeRightFirstLeftSecond: 3
            }
        }
    });

    Bridge.definei("SIL.Machine.Tokenization.IDetokenizer$2", function (TData, TToken) { return {
        $kind: "interface",
        $variance: [1,2]
    }; });

    Bridge.definei("SIL.Machine.Tokenization.ITokenizer$2", function (TData, TOffset) { return {
        $kind: "interface",
        $variance: [2,0]
    }; });

    Bridge.define("SIL.Machine.Tokenization.TokenizationExtensions", {
        statics: {
            methods: {
                tokenizeToStrings: function (tokenizer, str) {
                    return System.Linq.Enumerable.from(tokenizer[Bridge.geti(tokenizer, "SIL$Machine$Tokenization$ITokenizer$2$System$String$System$Int32$tokenize", "SIL$Machine$Tokenization$ITokenizer$2$tokenize")](str)).select(function (span) {
                            return str.substr(span.start, span.length);
                        });
                }
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.AlignmentType", {
        $kind: "enum",
        statics: {
            fields: {
                unknown: -1,
                notAligned: 0,
                aligned: 1
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.EcmScoreInfo", {
        props: {
            scores: null,
            operations: null
        },
        ctors: {
            init: function () {
                this.scores = new (System.Collections.Generic.List$1(System.Double))();
                this.operations = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EditOperation))();
            }
        },
        methods: {
            updatePositions: function (prevEsi, positions) {
                while (System.Array.getCount(this.scores, System.Double) < System.Array.getCount(prevEsi.scores, System.Double)) {
                    System.Array.add(this.scores, 0, System.Double);
                }

                while (System.Array.getCount(this.operations, SIL.Machine.Translation.EditOperation) < System.Array.getCount(prevEsi.operations, SIL.Machine.Translation.EditOperation)) {
                    System.Array.add(this.operations, 0, SIL.Machine.Translation.EditOperation);
                }

                for (var i = 0; i < System.Array.getCount(positions, System.Int32); i = (i + 1) | 0) {
                    System.Array.setItem(this.scores, System.Array.getItem(positions, i, System.Int32), System.Array.getItem(prevEsi.scores, System.Array.getItem(positions, i, System.Int32), System.Double), System.Double);
                    if (System.Array.getCount(prevEsi.operations, SIL.Machine.Translation.EditOperation) > i) {
                        System.Array.setItem(this.operations, System.Array.getItem(positions, i, System.Int32), System.Array.getItem(prevEsi.operations, System.Array.getItem(positions, i, System.Int32), SIL.Machine.Translation.EditOperation), SIL.Machine.Translation.EditOperation);
                    }
                }
            },
            removeLast: function () {
                if (System.Array.getCount(this.scores, System.Double) > 1) {
                    System.Array.removeAt(this.scores, ((System.Array.getCount(this.scores, System.Double) - 1) | 0), System.Double);
                }
                if (System.Array.getCount(this.operations, SIL.Machine.Translation.EditOperation) > 1) {
                    System.Array.removeAt(this.operations, ((System.Array.getCount(this.operations, SIL.Machine.Translation.EditOperation) - 1) | 0), SIL.Machine.Translation.EditOperation);
                }
            },
            getLastInsPrefixWordFromEsi: function () {
                var results = System.Array.init(System.Array.getCount(this.operations, SIL.Machine.Translation.EditOperation), 0, System.Int32);

                for (var j = (System.Array.getCount(this.operations, SIL.Machine.Translation.EditOperation) - 1) | 0; j >= 0; j = (j - 1) | 0) {
                    switch (System.Array.getItem(this.operations, j, SIL.Machine.Translation.EditOperation)) {
                        case SIL.Machine.Translation.EditOperation.hit: 
                            results[System.Array.index(j, results)] = (j - 1) | 0;
                            break;
                        case SIL.Machine.Translation.EditOperation.insert: 
                            var tj = j;
                            while (tj >= 0 && System.Array.getItem(this.operations, tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.insert) {
                                tj = (tj - 1) | 0;
                            }
                            if (System.Array.getItem(this.operations, tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.hit || System.Array.getItem(this.operations, tj, SIL.Machine.Translation.EditOperation) === SIL.Machine.Translation.EditOperation.substitute) {
                                tj = (tj - 1) | 0;
                            }
                            results[System.Array.index(j, results)] = tj;
                            break;
                        case SIL.Machine.Translation.EditOperation.delete: 
                            results[System.Array.index(j, results)] = j;
                            break;
                        case SIL.Machine.Translation.EditOperation.substitute: 
                            results[System.Array.index(j, results)] = (j - 1) | 0;
                            break;
                        case SIL.Machine.Translation.EditOperation.none: 
                            results[System.Array.index(j, results)] = 0;
                            break;
                    }
                }

                return results;
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.EditDistance$2", function (TSeq, TItem) { return {
        props: {
            hitCost: 0,
            insertionCost: 0,
            substitutionCost: 0,
            deletionCost: 0
        },
        methods: {
            compute: function (x, y) {
                return this.compute$3(x, y, true, false);
            },
            compute$1: function (x, y, ops) {
                return this.compute$4(x, y, true, false, ops);
            },
            compute$3: function (x, y, isLastItemComplete, usePrefixDelOp) {
                var distMatrix = { };
                return this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);
            },
            compute$4: function (x, y, isLastItemComplete, usePrefixDelOp, ops) {
                var distMatrix = { };
                var dist = this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);
                ops.v = System.Linq.Enumerable.from(this.getOperations(x, y, distMatrix.v, isLastItemComplete, usePrefixDelOp, this.getCount(x), this.getCount(y))).toArray();
                return dist;
            },
            compute$2: function (x, y, isLastItemComplete, usePrefixDelOp, distMatrix) {
                distMatrix.v = this.initDistMatrix(x, y);

                var xCount = this.getCount(x);
                var yCount = this.getCount(y);
                for (var i = 0; i <= xCount; i = (i + 1) | 0) {
                    for (var j = 0; j <= yCount; j = (j + 1) | 0) {
                        var iPred = { }, jPred = { };
                        var op = { v : new SIL.Machine.Translation.EditOperation() };
                        distMatrix.v.set([i, j], this.processMatrixCell(x, y, distMatrix.v, usePrefixDelOp, j !== yCount || isLastItemComplete, i, j, iPred, jPred, op));
                    }
                }

                return distMatrix.v.get([xCount, yCount]);
            },
            computePrefix: function (x, y, isLastItemComplete, usePrefixDelOp, ops) {
                return this.compute$4(x, y, isLastItemComplete, usePrefixDelOp, ops);
            },
            initDistMatrix: function (x, y) {
                var xCount = this.getCount(x);
                var yCount = this.getCount(y);
                var dim = Math.max(xCount, yCount);
                var distMatrix = System.Array.create(0, null, System.Double, ((dim + 1) | 0), ((dim + 1) | 0));
                return distMatrix;
            },
            getOperations: function (x, y, distMatrix, isLastItemComplete, usePrefixDelOp, i, j) {
                i = {v:i};
                j = {v:j};
                var yCount = this.getCount(y);
                var ops = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.EditOperation)).ctor();
                while (i.v > 0 || j.v > 0) {
                    var op = { v : new SIL.Machine.Translation.EditOperation() };
                    this.processMatrixCell(x, y, distMatrix, usePrefixDelOp, j.v !== yCount || isLastItemComplete, i.v, j.v, i, j, op);
                    if (op.v !== SIL.Machine.Translation.EditOperation.prefixDelete) {
                        ops.push(op.v);
                    }
                }
                return ops;
            },
            processMatrixCell: function (x, y, distMatrix, usePrefixDelOp, isComplete, i, j, iPred, jPred, op) {
                if (i !== 0 && j !== 0) {
                    var xItem = this.getItem(x, ((i - 1) | 0));
                    var yItem = this.getItem(y, ((j - 1) | 0));
                    var substCost;
                    if (this.isHit(xItem, yItem, isComplete)) {
                        substCost = this.getHitCost(xItem, yItem, isComplete);
                        op.v = SIL.Machine.Translation.EditOperation.hit;
                    } else {
                        substCost = this.getSubstitutionCost(xItem, yItem, isComplete);
                        op.v = SIL.Machine.Translation.EditOperation.substitute;
                    }

                    var cost = distMatrix.get([((i - 1) | 0), ((j - 1) | 0)]) + substCost;
                    var min = cost;
                    iPred.v = (i - 1) | 0;
                    jPred.v = (j - 1) | 0;

                    var delCost = usePrefixDelOp && j === this.getCount(y) ? 0 : this.getDeletionCost(xItem);
                    cost = distMatrix.get([((i - 1) | 0), j]) + delCost;
                    if (cost < min) {
                        min = cost;
                        iPred.v = (i - 1) | 0;
                        jPred.v = j;
                        op.v = delCost === 0 ? SIL.Machine.Translation.EditOperation.prefixDelete : SIL.Machine.Translation.EditOperation.delete;
                    }

                    cost = distMatrix.get([i, ((j - 1) | 0)]) + this.getInsertionCost(yItem);
                    if (cost < min) {
                        min = cost;
                        iPred.v = i;
                        jPred.v = (j - 1) | 0;
                        op.v = SIL.Machine.Translation.EditOperation.insert;
                    }

                    return min;
                }

                if (i === 0 && j === 0) {
                    iPred.v = 0;
                    jPred.v = 0;
                    op.v = SIL.Machine.Translation.EditOperation.none;
                    return 0;
                }

                if (i === 0) {
                    iPred.v = 0;
                    jPred.v = (j - 1) | 0;
                    op.v = SIL.Machine.Translation.EditOperation.insert;
                    return distMatrix.get([0, ((j - 1) | 0)]) + this.getInsertionCost(this.getItem(y, ((j - 1) | 0)));
                }

                iPred.v = (i - 1) | 0;
                jPred.v = 0;
                op.v = SIL.Machine.Translation.EditOperation.delete;
                return distMatrix.get([((i - 1) | 0), 0]) + this.getDeletionCost(this.getItem(x, ((i - 1) | 0)));
            }
        }
    }; });

    Bridge.define("SIL.Machine.Translation.EditOperation", {
        $kind: "enum",
        statics: {
            fields: {
                none: 0,
                hit: 1,
                insert: 2,
                delete: 3,
                prefixDelete: 4,
                substitute: 5
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionModel", {
        fields: {
            _segmentEditDistance: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this._segmentEditDistance = new SIL.Machine.Translation.SegmentEditDistance();
                this.setErrorModelParameters(128, 0.8, 1, 1, 1);
            }
        },
        methods: {
            setErrorModelParameters: function (vocSize, hitProb, insFactor, substFactor, delFactor) {
                var e;
                if (vocSize === 0) {
                    e = (1 - hitProb) / (insFactor + substFactor + delFactor);
                } else {
                    e = (1 - hitProb) / ((insFactor * vocSize) + (substFactor * (((vocSize - 1) | 0))) + delFactor);
                }

                var insProb = e * insFactor;
                var substProb = e * substFactor;
                var delProb = e * delFactor;

                this._segmentEditDistance.hitCost = -Bridge.Math.log(hitProb);
                this._segmentEditDistance.insertionCost = -Bridge.Math.log(insProb);
                this._segmentEditDistance.substitutionCost = -Bridge.Math.log(substProb);
                this._segmentEditDistance.deletionCost = -Bridge.Math.log(delProb);
            },
            setupInitialEsi: function (initialEsi) {
                var score = this._segmentEditDistance.compute(System.Array.init(0, null, System.String), System.Array.init(0, null, System.String));
                System.Array.clear(initialEsi.scores, System.Double);
                System.Array.add(initialEsi.scores, score, System.Double);
                System.Array.clear(initialEsi.operations, SIL.Machine.Translation.EditOperation);
            },
            setupEsi: function (esi, prevEsi, word) {
                var score = this._segmentEditDistance.compute(System.Array.init([word], System.String), System.Array.init(0, null, System.String));
                System.Array.clear(esi.scores, System.Double);
                System.Array.add(esi.scores, System.Array.getItem(prevEsi.scores, 0, System.Double) + score, System.Double);
                System.Array.clear(esi.operations, SIL.Machine.Translation.EditOperation);
                System.Array.add(esi.operations, SIL.Machine.Translation.EditOperation.none, SIL.Machine.Translation.EditOperation);
            },
            extendInitialEsi: function (initialEsi, prevInitialEsi, prefixDiff) {
                this._segmentEditDistance.incrComputePrefixFirstRow(initialEsi.scores, prevInitialEsi.scores, prefixDiff);
            },
            extendEsi: function (esi, prevEsi, word, prefixDiff, isLastWordComplete) {
                var $t;
                var ops = this._segmentEditDistance.incrComputePrefix(esi.scores, prevEsi.scores, word, prefixDiff, isLastWordComplete);
                $t = Bridge.getEnumerator(ops, SIL.Machine.Translation.EditOperation);
                try {
                    while ($t.moveNext()) {
                        var op = $t.Current;
                        System.Array.add(esi.operations, op, SIL.Machine.Translation.EditOperation);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            correctPrefix: function (correction, uncorrectedPrefixLen, prefix, isLastWordComplete) {
                var $t;
                if (uncorrectedPrefixLen === 0) {
                    $t = Bridge.getEnumerator(prefix, System.String);
                    try {
                        while ($t.moveNext()) {
                            var w = $t.Current;
                            System.Array.add(correction.target, w, System.String);
                            System.Array.add(correction.targetConfidences, -1, System.Double);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return System.Array.getCount(prefix, System.String);
                }

                var wordOps = { }, charOps = { };
                this._segmentEditDistance.computePrefix$1(System.Linq.Enumerable.from(correction.target).take(uncorrectedPrefixLen).toArray(System.String), prefix, isLastWordComplete, false, wordOps, charOps);
                return this.correctPrefix$1(correction, wordOps.v, charOps.v, prefix, isLastWordComplete);
            },
            correctPrefix$1: function (correction, wordOps, charOps, prefix, isLastWordComplete) {
                var $t;
                var alignmentColsToCopy = new (System.Collections.Generic.List$1(System.Int32))();

                var i = 0, j = 0, k = 0;
                $t = Bridge.getEnumerator(wordOps, SIL.Machine.Translation.EditOperation);
                try {
                    while ($t.moveNext()) {
                        var wordOp = $t.Current;
                        switch (wordOp) {
                            case SIL.Machine.Translation.EditOperation.insert: 
                                System.Array.insert(correction.target, j, System.Array.getItem(prefix, j, System.String), System.String);
                                System.Array.insert(correction.targetConfidences, j, -1, System.Double);
                                alignmentColsToCopy.add(-1);
                                for (var l = k; l < System.Array.getCount(correction.phrases, SIL.Machine.Translation.PhraseInfo); l = (l + 1) | 0) {
                                    System.Array.getItem(correction.phrases, l, SIL.Machine.Translation.PhraseInfo).targetCut = (System.Array.getItem(correction.phrases, l, SIL.Machine.Translation.PhraseInfo).targetCut + 1) | 0;
                                }
                                j = (j + 1) | 0;
                                break;
                            case SIL.Machine.Translation.EditOperation.delete: 
                                System.Array.removeAt(correction.target, j, System.String);
                                System.Array.removeAt(correction.targetConfidences, j, System.Double);
                                i = (i + 1) | 0;
                                if (k < System.Array.getCount(correction.phrases, SIL.Machine.Translation.PhraseInfo)) {
                                    for (var l1 = k; l1 < System.Array.getCount(correction.phrases, SIL.Machine.Translation.PhraseInfo); l1 = (l1 + 1) | 0) {
                                        System.Array.getItem(correction.phrases, l1, SIL.Machine.Translation.PhraseInfo).targetCut = (System.Array.getItem(correction.phrases, l1, SIL.Machine.Translation.PhraseInfo).targetCut - 1) | 0;
                                    }

                                    if (System.Array.getItem(correction.phrases, k, SIL.Machine.Translation.PhraseInfo).targetCut < 0 || (k > 0 && System.Array.getItem(correction.phrases, k, SIL.Machine.Translation.PhraseInfo).targetCut === System.Array.getItem(correction.phrases, ((k - 1) | 0), SIL.Machine.Translation.PhraseInfo).targetCut)) {
                                        System.Array.removeAt(correction.phrases, k, SIL.Machine.Translation.PhraseInfo);
                                        alignmentColsToCopy.clear();
                                        i = 0;
                                    } else if (j > System.Array.getItem(correction.phrases, k, SIL.Machine.Translation.PhraseInfo).targetCut) {
                                        this.resizeAlignment(correction, k, alignmentColsToCopy);
                                        alignmentColsToCopy.clear();
                                        i = 0;
                                        k = (k + 1) | 0;
                                    }
                                }
                                break;
                            case SIL.Machine.Translation.EditOperation.hit: 
                            case SIL.Machine.Translation.EditOperation.substitute: 
                                if (wordOp === SIL.Machine.Translation.EditOperation.substitute || j < ((System.Array.getCount(prefix, System.String) - 1) | 0) || isLastWordComplete) {
                                    System.Array.setItem(correction.target, j, System.Array.getItem(prefix, j, System.String), System.String);
                                } else {
                                    System.Array.setItem(correction.target, j, this.correctWord(charOps, System.Array.getItem(correction.target, j, System.String), System.Array.getItem(prefix, j, System.String)), System.String);
                                }
                                if (wordOp === SIL.Machine.Translation.EditOperation.substitute) {
                                    System.Array.setItem(correction.targetConfidences, j, -1, System.Double);
                                } else {
                                    if (wordOp === SIL.Machine.Translation.EditOperation.hit) {
                                        correction.targetUncorrectedPrefixWords.System$Collections$Generic$ISet$1$System$Int32$add(j);
                                    }
                                }
                                alignmentColsToCopy.add(i);
                                i = (i + 1) | 0;
                                j = (j + 1) | 0;
                                if (k < System.Array.getCount(correction.phrases, SIL.Machine.Translation.PhraseInfo) && j > System.Array.getItem(correction.phrases, k, SIL.Machine.Translation.PhraseInfo).targetCut) {
                                    this.resizeAlignment(correction, k, alignmentColsToCopy);
                                    alignmentColsToCopy.clear();
                                    i = 0;
                                    k = (k + 1) | 0;
                                }
                                break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                while (j < System.Array.getCount(correction.target, System.String)) {
                    alignmentColsToCopy.add(i);

                    i = (i + 1) | 0;
                    j = (j + 1) | 0;
                    if (k < System.Array.getCount(correction.phrases, SIL.Machine.Translation.PhraseInfo) && j > System.Array.getItem(correction.phrases, k, SIL.Machine.Translation.PhraseInfo).targetCut) {
                        this.resizeAlignment(correction, k, alignmentColsToCopy);
                        alignmentColsToCopy.clear();
                        break;
                    }
                }

                return alignmentColsToCopy.Count;
            },
            resizeAlignment: function (correction, phraseIndex, colsToCopy) {
                var curAlignment = System.Array.getItem(correction.phrases, phraseIndex, SIL.Machine.Translation.PhraseInfo).alignment;
                if (colsToCopy.Count === curAlignment.columnCount) {
                    return;
                }

                var newAlignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(curAlignment.rowCount, colsToCopy.Count);
                for (var j = 0; j < newAlignment.columnCount; j = (j + 1) | 0) {
                    if (colsToCopy.getItem(j) !== -1) {
                        for (var i = 0; i < newAlignment.rowCount; i = (i + 1) | 0) {
                            newAlignment.setitem(i, j, curAlignment.getitem(i, colsToCopy.getItem(j)));
                        }
                    }
                }

                System.Array.getItem(correction.phrases, phraseIndex, SIL.Machine.Translation.PhraseInfo).alignment = newAlignment;
            },
            correctWord: function (charOps, word, prefix) {
                var $t;
                var sb = new System.Text.StringBuilder();
                var i = 0, j = 0;
                $t = Bridge.getEnumerator(charOps, SIL.Machine.Translation.EditOperation);
                try {
                    while ($t.moveNext()) {
                        var charOp = $t.Current;
                        switch (charOp) {
                            case SIL.Machine.Translation.EditOperation.hit: 
                                sb.append(String.fromCharCode(word.charCodeAt(i)));
                                i = (i + 1) | 0;
                                j = (j + 1) | 0;
                                break;
                            case SIL.Machine.Translation.EditOperation.insert: 
                                sb.append(String.fromCharCode(prefix.charCodeAt(j)));
                                j = (j + 1) | 0;
                                break;
                            case SIL.Machine.Translation.EditOperation.delete: 
                                i = (i + 1) | 0;
                                break;
                            case SIL.Machine.Translation.EditOperation.substitute: 
                                sb.append(String.fromCharCode(prefix.charCodeAt(j)));
                                i = (i + 1) | 0;
                                j = (j + 1) | 0;
                                break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                sb.append(word.substr(i));
                return sb.toString();
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor", {
        statics: {
            methods: {
                addToNBestList: function (T, nbestList, n, item) {
                    var index = nbestList.binarySearch(item);
                    if (index < 0) {
                        index = ~index;
                    } else {
                        index = (index + 1) | 0;
                    }
                    if (nbestList.Count < n) {
                        nbestList.insert(index, item);
                    } else if (index < nbestList.Count) {
                        nbestList.insert(index, item);
                        nbestList.removeAt(((nbestList.Count - 1) | 0));
                    }
                }
            }
        },
        fields: {
            _wordGraph: null,
            _restScores: null,
            _ecm: null,
            _stateEcmScoreInfos: null,
            _arcEcmScoreInfos: null,
            _stateBestScores: null,
            _stateWordGraphScores: null,
            _stateBestPrevArcs: null,
            _statesInvolvedInArcs: null,
            _prevPrefix: null,
            _prevIsLastWordComplete: false
        },
        props: {
            ecmWeight: 0,
            wordGraphWeight: 0
        },
        ctors: {
            ctor: function (ecm, wordGraph, ecmWeight, wordGraphWeight) {
                if (ecmWeight === void 0) { ecmWeight = 1.0; }
                if (wordGraphWeight === void 0) { wordGraphWeight = 1.0; }

                this.$initialize();
                this._ecm = ecm;
                this._wordGraph = wordGraph;
                this.ecmWeight = ecmWeight;
                this.wordGraphWeight = wordGraphWeight;

                this._restScores = System.Linq.Enumerable.from(this._wordGraph.computeRestScores()).toArray();
                this._stateEcmScoreInfos = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo))();
                this._arcEcmScoreInfos = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo)))();
                this._stateBestScores = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(System.Double)))();
                this._stateWordGraphScores = new (System.Collections.Generic.List$1(System.Double))();
                this._stateBestPrevArcs = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(System.Int32)))();
                this._statesInvolvedInArcs = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
                this._prevPrefix = System.Array.init(0, null, System.String);

                this.initStates();
                this.initArcs();
            }
        },
        methods: {
            initStates: function () {
                for (var i = 0; i < this._wordGraph.stateCount; i = (i + 1) | 0) {
                    this._stateEcmScoreInfos.add(new SIL.Machine.Translation.EcmScoreInfo());
                    this._stateWordGraphScores.add(0);
                    this._stateBestScores.add(new (System.Collections.Generic.List$1(System.Double))());
                    this._stateBestPrevArcs.add(new (System.Collections.Generic.List$1(System.Int32))());
                }

                if (!this._wordGraph.isEmpty) {
                    this._ecm.setupInitialEsi(this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.initialState));
                    this.updateInitialStateBestScores();
                }
            },
            initArcs: function () {
                var $t;
                for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.arcs, SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                    var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);

                    // init ecm score info for each word of arc
                    var prevEsi = this._stateEcmScoreInfos.getItem(arc.prevState);
                    var esis = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EcmScoreInfo))();
                    $t = Bridge.getEnumerator(arc.words, System.String);
                    try {
                        while ($t.moveNext()) {
                            var word = $t.Current;
                            var esi = new SIL.Machine.Translation.EcmScoreInfo();
                            this._ecm.setupEsi(esi, prevEsi, word);
                            esis.add(esi);
                            prevEsi = esi;
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }this._arcEcmScoreInfos.add(esis);

                    // init best scores for the arc's successive state
                    this.updateStateBestScores(arcIndex, 0);

                    this._statesInvolvedInArcs.add(arc.prevState);
                    this._statesInvolvedInArcs.add(arc.nextState);
                }
            },
            updateInitialStateBestScores: function () {
                var $t;
                var esi = this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.initialState);

                this._stateWordGraphScores.setItem(SIL.Machine.Translation.WordGraph.initialState, this._wordGraph.initialStateScore);

                var bestScores = this._stateBestScores.getItem(SIL.Machine.Translation.WordGraph.initialState);
                var bestPrevArcs = this._stateBestPrevArcs.getItem(SIL.Machine.Translation.WordGraph.initialState);

                bestScores.clear();
                bestPrevArcs.clear();

                $t = Bridge.getEnumerator(esi.scores, System.Double);
                try {
                    while ($t.moveNext()) {
                        var score = $t.Current;
                        bestScores.add((this.ecmWeight * -score) + (this.wordGraphWeight * this._wordGraph.initialStateScore));
                        bestPrevArcs.add(2147483647);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            updateStateBestScores: function (arcIndex, prefixDiffSize) {
                var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);
                var arcEsis = this._arcEcmScoreInfos.getItem(arcIndex);

                var prevEsi = arcEsis.Count === 0 ? this._stateEcmScoreInfos.getItem(arc.prevState) : arcEsis.getItem(((arcEsis.Count - 1) | 0));

                var wordGraphScore = this._stateWordGraphScores.getItem(arc.prevState) + arc.score;

                var nextStateBestScores = this._stateBestScores.getItem(arc.nextState);
                var nextStateBestPrevArcs = this._stateBestPrevArcs.getItem(arc.nextState);

                var positions = new (System.Collections.Generic.List$1(System.Int32))();
                var startPos = prefixDiffSize === 0 ? 0 : ((System.Array.getCount(prevEsi.scores, System.Double) - prefixDiffSize) | 0);
                for (var i = startPos; i < System.Array.getCount(prevEsi.scores, System.Double); i = (i + 1) | 0) {
                    var newScore = (this.ecmWeight * -System.Array.getItem(prevEsi.scores, i, System.Double)) + (this.wordGraphWeight * wordGraphScore);

                    if (i === nextStateBestScores.Count || nextStateBestScores.getItem(i) < newScore) {
                        this.addOrReplace(System.Double, nextStateBestScores, i, newScore);
                        positions.add(i);
                        this.addOrReplace(System.Int32, nextStateBestPrevArcs, i, arcIndex);
                    }
                }

                this._stateEcmScoreInfos.getItem(arc.nextState).updatePositions(prevEsi, positions);

                this._stateWordGraphScores.setItem(arc.nextState, wordGraphScore);
            },
            addOrReplace: function (T, list, index, item) {
                if (index > list.Count) {
                    throw new System.ArgumentOutOfRangeException("index");
                }

                if (index === list.Count) {
                    list.add(item);
                } else {
                    list.setItem(index, item);
                }
            },
            correct: function (prefix, isLastWordComplete, n) {
                var $t, $t1, $t2;
                // get valid portion of the processed prefix vector
                var validProcPrefixCount = 0;
                for (var i = 0; i < this._prevPrefix.length; i = (i + 1) | 0) {
                    if (i >= System.Array.getCount(prefix, System.String)) {
                        break;
                    }

                    if (i === ((this._prevPrefix.length - 1) | 0) && i === ((System.Array.getCount(prefix, System.String) - 1) | 0)) {
                        if (Bridge.referenceEquals(this._prevPrefix[System.Array.index(i, this._prevPrefix)], System.Array.getItem(prefix, i, System.String)) && this._prevIsLastWordComplete === isLastWordComplete) {
                            validProcPrefixCount = (validProcPrefixCount + 1) | 0;
                        }
                    } else if (Bridge.referenceEquals(this._prevPrefix[System.Array.index(i, this._prevPrefix)], System.Array.getItem(prefix, i, System.String))) {
                        validProcPrefixCount = (validProcPrefixCount + 1) | 0;
                    }
                }

                var diffSize = (this._prevPrefix.length - validProcPrefixCount) | 0;
                if (diffSize > 0) {
                    // adjust size of info for arcs
                    $t = Bridge.getEnumerator(this._arcEcmScoreInfos);
                    try {
                        while ($t.moveNext()) {
                            var esis = $t.Current;
                            $t1 = Bridge.getEnumerator(esis);
                            try {
                                while ($t1.moveNext()) {
                                    var esi = $t1.Current;
                                    for (var i1 = 0; i1 < diffSize; i1 = (i1 + 1) | 0) {
                                        esi.removeLast();
                                    }
                                }
                            } finally {
                                if (Bridge.is($t1, System.IDisposable)) {
                                    $t1.System$IDisposable$dispose();
                                }
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    // adjust size of info for states
                    $t2 = Bridge.getEnumerator(this._statesInvolvedInArcs);
                    try {
                        while ($t2.moveNext()) {
                            var state = $t2.Current;
                            for (var i2 = 0; i2 < diffSize; i2 = (i2 + 1) | 0) {
                                this._stateEcmScoreInfos.getItem(state).removeLast();
                                this._stateBestScores.getItem(state).removeAt(((this._stateBestScores.getItem(state).Count - 1) | 0));
                                this._stateBestPrevArcs.getItem(state).removeAt(((this._stateBestPrevArcs.getItem(state).Count - 1) | 0));
                            }
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$dispose();
                        }
                    }}

                // get difference between prefix and valid portion of processed prefix
                var prefixDiff = System.Array.init(((System.Array.getCount(prefix, System.String) - validProcPrefixCount) | 0), null, System.String);
                for (var i3 = 0; i3 < prefixDiff.length; i3 = (i3 + 1) | 0) {
                    prefixDiff[System.Array.index(i3, prefixDiff)] = System.Array.getItem(prefix, ((validProcPrefixCount + i3) | 0), System.String);
                }

                // process word-graph given prefix difference
                this.processWordGraphForPrefixDiff(prefixDiff, isLastWordComplete);

                var candidates = new (System.Collections.Generic.List$1(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate))();
                this.getNBestStateCandidates(candidates, n);
                this.getNBestSubStateCandidates(candidates, n);

                var nbestCorrections = System.Linq.Enumerable.from(candidates).select(Bridge.fn.bind(this, function (c) {
                        return this.getCorrectionForCandidate(prefix, isLastWordComplete, c);
                    })).toArray(SIL.Machine.Translation.TranslationInfo);

                this._prevPrefix = System.Linq.Enumerable.from(prefix).toArray();
                this._prevIsLastWordComplete = isLastWordComplete;

                return nbestCorrections;
            },
            processWordGraphForPrefixDiff: function (prefixDiff, isLastWordComplete) {
                if (System.Array.getCount(prefixDiff, System.String) === 0) {
                    return;
                }

                if (!this._wordGraph.isEmpty) {
                    var prevInitialEsi = this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.initialState);
                    this._ecm.extendInitialEsi(this._stateEcmScoreInfos.getItem(SIL.Machine.Translation.WordGraph.initialState), prevInitialEsi, prefixDiff);
                    this.updateInitialStateBestScores();
                }

                for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.arcs, SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                    var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);

                    // update ecm score info for each word of arc
                    var prevEsi = this._stateEcmScoreInfos.getItem(arc.prevState);
                    var esis = this._arcEcmScoreInfos.getItem(arcIndex);
                    while (esis.Count < System.Array.getCount(arc.words, System.String)) {
                        esis.add(new SIL.Machine.Translation.EcmScoreInfo());
                    }
                    for (var i = 0; i < System.Array.getCount(arc.words, System.String); i = (i + 1) | 0) {
                        var esi = esis.getItem(i);
                        this._ecm.extendEsi(esi, prevEsi, arc.isUnknown ? "" : System.Array.getItem(arc.words, i, System.String), prefixDiff, isLastWordComplete);
                        prevEsi = esi;
                    }

                    // update best scores for the arc's successive state
                    this.updateStateBestScores(arcIndex, System.Array.getCount(prefixDiff, System.String));
                }
            },
            getNBestStateCandidates: function (candidates, n) {
                var $t;
                $t = Bridge.getEnumerator(this._statesInvolvedInArcs);
                try {
                    while ($t.moveNext()) {
                        var state = $t.Current;
                        var restScore = this._restScores[System.Array.index(state, this._restScores)];
                        var bestScores = this._stateBestScores.getItem(state);

                        var score = bestScores.getItem(((bestScores.Count - 1) | 0)) + (this.wordGraphWeight * restScore);
                        SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.addToNBestList(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate, candidates, n, new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate(score, state));
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            getNBestSubStateCandidates: function (candidates, n) {
                for (var arcIndex = 0; arcIndex < System.Array.getCount(this._wordGraph.arcs, SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                    var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);
                    if (System.Array.getCount(arc.words, System.String) > 1) {
                        var wordGraphScore = this._stateWordGraphScores.getItem(arc.prevState);

                        for (var i = 0; i < ((System.Array.getCount(arc.words, System.String) - 1) | 0); i = (i + 1) | 0) {
                            var esi = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i);
                            var score = (this.wordGraphWeight * wordGraphScore) + (this.ecmWeight * -System.Array.getItem(esi.scores, ((System.Array.getCount(esi.scores, System.Double) - 1) | 0), System.Double)) + (this.wordGraphWeight * this._restScores[System.Array.index(arc.prevState, this._restScores)]);
                            SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.addToNBestList(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate, candidates, n, new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate(score, arc.nextState, arcIndex, i));
                        }
                    }
                }
            },
            getCorrectionForCandidate: function (prefix, isLastWordComplete, candidate) {
                var $t;
                var correction = ($t = new SIL.Machine.Translation.TranslationInfo(), $t.score = candidate.score, $t);

                var uncorrectedPrefixLen;
                if (candidate.arcIndex === -1) {
                    this.addBestUncorrectedPrefixState(correction, System.Array.getCount(prefix, System.String), candidate.state);
                    uncorrectedPrefixLen = System.Array.getCount(correction.target, System.String);
                } else {
                    this.addBestUncorrectedPrefixSubState(correction, System.Array.getCount(prefix, System.String), candidate.arcIndex, candidate.arcWordIndex);
                    var firstArc = System.Array.getItem(this._wordGraph.arcs, candidate.arcIndex, SIL.Machine.Translation.WordGraphArc);
                    uncorrectedPrefixLen = (((((System.Array.getCount(correction.target, System.String) - System.Array.getCount(firstArc.words, System.String)) | 0) - candidate.arcWordIndex) | 0) + 1) | 0;
                }

                var alignmentColsToAddCount = this._ecm.correctPrefix(correction, uncorrectedPrefixLen, prefix, isLastWordComplete);

                $t = Bridge.getEnumerator(System.Linq.Enumerable.from(this._wordGraph.getBestPathFromFinalStateToState(candidate.state)).reverse());
                try {
                    while ($t.moveNext()) {
                        var arc = $t.Current;
                        this.updateCorrectionFromArc(correction, arc, false, alignmentColsToAddCount);
                        alignmentColsToAddCount = 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                return correction;
            },
            addBestUncorrectedPrefixState: function (correction, procPrefixPos, state) {
                var $t;
                var arcs = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.WordGraphArc)).ctor();

                var curState = state;
                var curProcPrefixPos = procPrefixPos;
                while (curState !== 0) {
                    var arcIndex = this._stateBestPrevArcs.getItem(curState).getItem(curProcPrefixPos);
                    var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);

                    for (var i = (System.Array.getCount(arc.words, System.String) - 1) | 0; i >= 0; i = (i - 1) | 0) {
                        var predPrefixWords = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i).getLastInsPrefixWordFromEsi();
                        curProcPrefixPos = System.Array.getItem(predPrefixWords, curProcPrefixPos, System.Int32);
                    }

                    arcs.push(arc);

                    curState = arc.prevState;
                }

                $t = Bridge.getEnumerator(arcs);
                try {
                    while ($t.moveNext()) {
                        var arc1 = $t.Current;
                        this.updateCorrectionFromArc(correction, arc1, true, 0);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }},
            addBestUncorrectedPrefixSubState: function (correction, procPrefixPos, arcIndex, arcWordIndex) {
                var arc = System.Array.getItem(this._wordGraph.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);

                var curProcPrefixPos = procPrefixPos;
                for (var i = arcWordIndex; i >= 0; i = (i - 1) | 0) {
                    var predPrefixWords = this._arcEcmScoreInfos.getItem(arcIndex).getItem(i).getLastInsPrefixWordFromEsi();
                    curProcPrefixPos = System.Array.getItem(predPrefixWords, curProcPrefixPos, System.Int32);
                }

                this.addBestUncorrectedPrefixState(correction, curProcPrefixPos, arc.prevState);

                this.updateCorrectionFromArc(correction, arc, true, 0);
            },
            updateCorrectionFromArc: function (correction, arc, isPrefix, alignmentColsToAddCount) {
                var $t;
                for (var i = 0; i < System.Array.getCount(arc.words, System.String); i = (i + 1) | 0) {
                    System.Array.add(correction.target, System.Array.getItem(arc.words, i, System.String), System.String);
                    System.Array.add(correction.targetConfidences, System.Array.getItem(arc.wordConfidences, i, System.Double), System.Double);
                    if (!isPrefix && arc.isUnknown) {
                        correction.targetUnknownWords.System$Collections$Generic$ISet$1$System$Int32$add(((System.Array.getCount(correction.target, System.String) - 1) | 0));
                    }
                }

                var alignment = arc.alignment;
                if (alignmentColsToAddCount > 0) {
                    var newAlignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(alignment.rowCount, ((alignment.columnCount + alignmentColsToAddCount) | 0));
                    for (var j = 0; j < alignment.columnCount; j = (j + 1) | 0) {
                        for (var i1 = 0; i1 < alignment.rowCount; i1 = (i1 + 1) | 0) {
                            newAlignment.setitem(i1, ((alignmentColsToAddCount + j) | 0), alignment.getitem(i1, j));
                        }
                    }
                    alignment = newAlignment;
                }

                var phrase = ($t = new SIL.Machine.Translation.PhraseInfo(), $t.sourceStartIndex = arc.sourceStartIndex, $t.sourceEndIndex = arc.sourceEndIndex, $t.targetCut = ((System.Array.getCount(correction.target, System.String) - 1) | 0), $t.alignment = alignment, $t);
                System.Array.add(correction.phrases, phrase, SIL.Machine.Translation.PhraseInfo);
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate", {
        inherits: function () { return [System.IComparable$1(SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor.Candidate)]; },
        props: {
            score: 0,
            state: 0,
            arcIndex: 0,
            arcWordIndex: 0
        },
        alias: ["compareTo", ["System$IComparable$1$SIL$Machine$Translation$ErrorCorrectionWordGraphProcessor$Candidate$compareTo", "System$IComparable$1$compareTo"]],
        ctors: {
            ctor: function (score, state, arcIndex, arcWordIndex) {
                if (arcIndex === void 0) { arcIndex = -1; }
                if (arcWordIndex === void 0) { arcWordIndex = -1; }

                this.$initialize();
                this.score = score;
                this.state = state;
                this.arcIndex = arcIndex;
                this.arcWordIndex = arcWordIndex;
            }
        },
        methods: {
            compareTo: function (other) {
                return ((-Bridge.compare(this.score, other.score)) | 0);
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.InteractiveTranslationResult", {
        props: {
            smtWordGraph: null,
            ruleResult: null
        },
        ctors: {
            ctor: function (smtWordGraph, ruleResult) {
                this.$initialize();
                this.smtWordGraph = smtWordGraph;
                this.ruleResult = ruleResult;
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.InteractiveTranslationSession", {
        statics: {
            fields: {
                ruleEngineThreshold: 0
            },
            ctors: {
                init: function () {
                    this.ruleEngineThreshold = 0.05;
                }
            }
        },
        fields: {
            _engine: null,
            _wordGraphProcessor: null,
            _curResult: null,
            _confidenceThreshold: 0
        },
        props: {
            smtWordGraph: null,
            ruleResult: null,
            sourceSegment: null,
            confidenceThreshold: {
                get: function () {
                    return this._confidenceThreshold;
                },
                set: function (value) {
                    if (this._confidenceThreshold !== value) {
                        this._confidenceThreshold = value;
                        this.updateSuggestion();
                    }
                }
            },
            prefix: null,
            isLastWordComplete: false,
            currentSuggestion: null
        },
        ctors: {
            ctor: function (engine, sourceSegment, confidenceThreshold, result) {
                this.$initialize();
                this._engine = engine;
                this.sourceSegment = sourceSegment;
                this._confidenceThreshold = confidenceThreshold;
                this.ruleResult = result.ruleResult;
                this.smtWordGraph = result.smtWordGraph;

                this._wordGraphProcessor = new SIL.Machine.Translation.ErrorCorrectionWordGraphProcessor(this._engine.errorCorrectionModel, this.smtWordGraph);
                this.updatePrefix("");
            }
        },
        methods: {
            updatePrefix: function (prefix) {
                var tokenSpans = System.Linq.Enumerable.from(this._engine.targetTokenizer[Bridge.geti(this._engine.targetTokenizer, "SIL$Machine$Tokenization$ITokenizer$2$System$String$System$Int32$tokenize", "SIL$Machine$Tokenization$ITokenizer$2$tokenize")](prefix)).toArray();
                this.prefix = System.Linq.Enumerable.from(tokenSpans).select(function (s) {
                        return prefix.substr(s.start, s.length);
                    }).toArray(System.String);
                this.isLastWordComplete = tokenSpans.length === 0 || tokenSpans[System.Array.index(((tokenSpans.length - 1) | 0), tokenSpans)].end !== prefix.length;

                var correction = System.Linq.Enumerable.from(this._wordGraphProcessor.correct(this.prefix, this.isLastWordComplete, 1)).firstOrDefault(null, null);
                var smtResult = this.createResult(correction);

                if (this.ruleResult == null) {
                    this._curResult = smtResult;
                } else {
                    var prefixCount = this.prefix.length;
                    if (!this.isLastWordComplete) {
                        prefixCount = (prefixCount - 1) | 0;
                    }

                    this._curResult = smtResult.merge(prefixCount, SIL.Machine.Translation.InteractiveTranslationSession.ruleEngineThreshold, this.ruleResult);
                }

                this.updateSuggestion();

                return this.currentSuggestion;
            },
            updateSuggestion: function () {
                var suggestions = System.Linq.Enumerable.from(SIL.Machine.Translation.TranslationSuggester.getSuggestedWordIndices(this.prefix, this.isLastWordComplete, this._curResult, this._confidenceThreshold)).select(Bridge.fn.bind(this, $asm.$.SIL.Machine.Translation.InteractiveTranslationSession.f1)).toArray(System.String);

                this.currentSuggestion = suggestions;
            },
            approve: function (onFinished) {
                this._engine.restClient.trainSegmentPairAsync(this.sourceSegment, this.prefix).continueWith(function (t) {
                    onFinished(!t.isFaulted());
                });
            },
            createResult: function (info) {
                var $t;
                if (info == null) {
                    return new SIL.Machine.Translation.TranslationResult(this.sourceSegment, System.Linq.Enumerable.empty(), System.Linq.Enumerable.empty(), System.Linq.Enumerable.empty(), new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(this.sourceSegment.length, 0));
                }

                var confidences = System.Linq.Enumerable.from(info.targetConfidences).toArray();
                var sources = System.Array.init(System.Array.getCount(info.target, System.String), 0, SIL.Machine.Translation.TranslationSources);
                var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(this.sourceSegment.length, System.Array.getCount(info.target, System.String));
                var trgPhraseStartIndex = 0;
                $t = Bridge.getEnumerator(info.phrases, SIL.Machine.Translation.PhraseInfo);
                try {
                    while ($t.moveNext()) {
                        var phrase = $t.Current;
                        for (var j = trgPhraseStartIndex; j <= phrase.targetCut; j = (j + 1) | 0) {
                            for (var i = phrase.sourceStartIndex; i <= phrase.sourceEndIndex; i = (i + 1) | 0) {
                                if (phrase.alignment.getitem(((i - phrase.sourceStartIndex) | 0), ((j - trgPhraseStartIndex) | 0)) === SIL.Machine.Translation.AlignmentType.aligned) {
                                    alignment.setitem(i, j, SIL.Machine.Translation.AlignmentType.aligned);
                                }
                            }
                            sources[System.Array.index(j, sources)] = System.Array.contains(info.targetUnknownWords, j, System.Int32) ? SIL.Machine.Translation.TranslationSources.none : SIL.Machine.Translation.TranslationSources.smt;
                        }
                        trgPhraseStartIndex = (phrase.targetCut + 1) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                return new SIL.Machine.Translation.TranslationResult(this.sourceSegment, info.target, confidences, sources, alignment);
            }
        }
    });

    Bridge.ns("SIL.Machine.Translation.InteractiveTranslationSession", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Translation.InteractiveTranslationSession, {
        f1: function (j) {
            return System.Array.getItem(this._curResult.targetSegment, j, System.String);
        }
    });

    Bridge.define("SIL.Machine.Translation.PhraseInfo", {
        props: {
            sourceStartIndex: 0,
            sourceEndIndex: 0,
            targetCut: 0,
            alignment: null
        }
    });

    Bridge.define("SIL.Machine.Translation.Preprocessors", {
        statics: {
            methods: {
                lowercase: function (str) {
                    return str.toLowerCase();
                },
                null: function (str) {
                    return str;
                }
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.SmtTrainProgress", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new SIL.Machine.Translation.SmtTrainProgress(); }
            }
        },
        props: {
            currentStep: 0,
            currentStepMessage: null,
            stepCount: 0,
            percentCompleted: {
                get: function () {
                    return Bridge.Int.clip32(Bridge.Math.round((this.currentStep / this.stepCount) * 100.0, 0, 4));
                }
            }
        },
        ctors: {
            $ctor1: function (currentStep, currentStepMessage, stepCount) {
                this.$initialize();
                this.currentStep = currentStep;
                this.currentStepMessage = currentStepMessage;
                this.stepCount = stepCount;
            },
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([6941615751, this.currentStep, this.currentStepMessage, this.stepCount]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, SIL.Machine.Translation.SmtTrainProgress)) {
                    return false;
                }
                return Bridge.equals(this.currentStep, o.currentStep) && Bridge.equals(this.currentStepMessage, o.currentStepMessage) && Bridge.equals(this.stepCount, o.stepCount);
            },
            $clone: function (to) { return this; }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationEngine", {
        props: {
            restClient: null,
            sourceTokenizer: null,
            targetTokenizer: null,
            errorCorrectionModel: null
        },
        ctors: {
            ctor: function (baseUrl, projectId) {
                SIL.Machine.Translation.TranslationEngine.$ctor1.call(this, baseUrl, projectId, new SIL.Machine.Tokenization.LatinWordTokenizer.ctor());
            },
            $ctor1: function (baseUrl, projectId, tokenizer) {
                SIL.Machine.Translation.TranslationEngine.$ctor2.call(this, baseUrl, projectId, tokenizer, tokenizer);
            },
            $ctor2: function (baseUrl, projectId, sourceTokenizer, targetTokenizer) {
                SIL.Machine.Translation.TranslationEngine.$ctor3.call(this, baseUrl, projectId, sourceTokenizer, targetTokenizer, new SIL.Machine.WebApi.Client.AjaxHttpClient());
            },
            $ctor3: function (baseUrl, projectId, sourceTokenizer, targetTokenizer, httpClient) {
                this.$initialize();
                this.sourceTokenizer = sourceTokenizer;
                this.targetTokenizer = targetTokenizer;
                if (!System.String.endsWith(baseUrl, "/")) {
                    baseUrl = System.String.concat(baseUrl, "/");
                }
                this.restClient = new SIL.Machine.WebApi.Client.TranslationRestClient(baseUrl, projectId, httpClient);
                this.errorCorrectionModel = new SIL.Machine.Translation.ErrorCorrectionModel();
            }
        },
        methods: {
            translateInteractively: function (sourceSegment, confidenceThreshold, onFinished) {
                var tokens = System.Linq.Enumerable.from(SIL.Machine.Tokenization.TokenizationExtensions.tokenizeToStrings(this.sourceTokenizer, sourceSegment)).toArray();
                var task = this.restClient.translateInteractivelyAsync(tokens);
                task.continueWith(Bridge.fn.bind(this, function (t) {
                    onFinished(t.isFaulted() ? null : new SIL.Machine.Translation.InteractiveTranslationSession(this, tokens, confidenceThreshold, t.getResult()));
                }));
            },
            train: function (onStatusUpdate, onFinished) {
                this.restClient.trainAsync(onStatusUpdate).continueWith(function (t) {
                    onFinished(!t.isFaulted());
                });
            },
            listenForTrainingStatus: function (onStatusUpdate, onFinished) {
                this.restClient.listenForTrainingStatus(onStatusUpdate).continueWith(function (t) {
                    onFinished(!t.isFaulted());
                });
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationInfo", {
        props: {
            target: null,
            targetConfidences: null,
            phrases: null,
            targetUnknownWords: null,
            targetUncorrectedPrefixWords: null,
            score: 0
        },
        ctors: {
            init: function () {
                this.target = new (System.Collections.Generic.List$1(System.String))();
                this.targetConfidences = new (System.Collections.Generic.List$1(System.Double))();
                this.phrases = new (System.Collections.Generic.List$1(SIL.Machine.Translation.PhraseInfo))();
                this.targetUnknownWords = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
                this.targetUncorrectedPrefixWords = new (System.Collections.Generic.HashSet$1(System.Int32)).ctor();
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationResult", {
        props: {
            sourceSegment: null,
            targetSegment: null,
            targetWordConfidences: null,
            targetWordSources: null,
            alignment: null
        },
        ctors: {
            ctor: function (sourceSegment, targetSegment, confidences, sources, alignment) {
                this.$initialize();
                this.sourceSegment = System.Linq.Enumerable.from(sourceSegment).toArray();
                this.targetSegment = System.Linq.Enumerable.from(targetSegment).toArray();
                this.targetWordConfidences = System.Linq.Enumerable.from(confidences).toArray();
                if (System.Array.getCount(this.targetWordConfidences, System.Double) !== System.Array.getCount(this.targetSegment, System.String)) {
                    throw new System.ArgumentException("The confidences must be the same length as the target segment.", "confidences");
                }
                this.targetWordSources = System.Linq.Enumerable.from(sources).toArray();
                if (System.Array.getCount(this.targetWordSources, SIL.Machine.Translation.TranslationSources) !== System.Array.getCount(this.targetSegment, System.String)) {
                    throw new System.ArgumentException("The sources must be the same length as the target segment.", "sources");
                }
                this.alignment = alignment;
                if (this.alignment.rowCount !== System.Array.getCount(this.sourceSegment, System.String)) {
                    throw new System.ArgumentException("The alignment source length must be the same length as the source segment.", "alignment");
                }
                if (this.alignment.columnCount !== System.Array.getCount(this.targetSegment, System.String)) {
                    throw new System.ArgumentException("The alignment target length must be the same length as the target segment.", "alignment");
                }
            }
        },
        methods: {
            merge: function (prefixCount, threshold, otherResult) {
                var $t, $t1, $t2, $t3, $t4, $t5;
                var mergedTargetSegment = new (System.Collections.Generic.List$1(System.String))();
                var mergedConfidences = new (System.Collections.Generic.List$1(System.Double))();
                var mergedSources = new (System.Collections.Generic.List$1(SIL.Machine.Translation.TranslationSources))();
                var mergedAlignment = new (System.Collections.Generic.HashSet$1(System.Object)).ctor();
                for (var j = 0; j < System.Array.getCount(this.targetSegment, System.String); j = (j + 1) | 0) {
                    var sourceIndices = System.Linq.Enumerable.from(this.alignment.getColumnAlignedIndices(j)).toArray();
                    if (sourceIndices.length === 0) {
                        // target word doesn't align with anything
                        mergedTargetSegment.add(System.Array.getItem(this.targetSegment, j, System.String));
                        mergedConfidences.add(System.Array.getItem(this.targetWordConfidences, j, System.Double));
                        mergedSources.add(System.Array.getItem(this.targetWordSources, j, SIL.Machine.Translation.TranslationSources));
                    } else {
                        // target word aligns with some source words
                        if (j < prefixCount || System.Array.getItem(this.targetWordConfidences, j, System.Double) >= threshold) {
                            // use target word of this result
                            mergedTargetSegment.add(System.Array.getItem(this.targetSegment, j, System.String));
                            mergedConfidences.add(System.Array.getItem(this.targetWordConfidences, j, System.Double));
                            var sources = System.Array.getItem(this.targetWordSources, j, SIL.Machine.Translation.TranslationSources);
                            $t = Bridge.getEnumerator(sourceIndices);
                            try {
                                while ($t.moveNext()) {
                                    var i = $t.Current;
                                    // combine sources for any words that both this result and the other result translated the same
                                    $t1 = Bridge.getEnumerator(otherResult.alignment.getRowAlignedIndices(i), System.Int32);
                                    try {
                                        while ($t1.moveNext()) {
                                            var jOther = $t1.Current;
                                            var otherSources = System.Array.getItem(otherResult.targetWordSources, jOther, SIL.Machine.Translation.TranslationSources);
                                            if (otherSources !== SIL.Machine.Translation.TranslationSources.none && Bridge.referenceEquals(System.Array.getItem(otherResult.targetSegment, jOther, System.String), System.Array.getItem(this.targetSegment, j, System.String))) {
                                                sources |= otherSources;
                                            }
                                        }
                                    } finally {
                                        if (Bridge.is($t1, System.IDisposable)) {
                                            $t1.System$IDisposable$dispose();
                                        }
                                    }
                                    mergedAlignment.add({ item1: i, item2: ((mergedTargetSegment.Count - 1) | 0) });
                                }
                            } finally {
                                if (Bridge.is($t, System.IDisposable)) {
                                    $t.System$IDisposable$dispose();
                                }
                            }mergedSources.add(sources);
                        } else {
                            // use target words of other result
                            var found = false;
                            $t2 = Bridge.getEnumerator(sourceIndices);
                            try {
                                while ($t2.moveNext()) {
                                    var i1 = $t2.Current;
                                    $t3 = Bridge.getEnumerator(otherResult.alignment.getRowAlignedIndices(i1), System.Int32);
                                    try {
                                        while ($t3.moveNext()) {
                                            var jOther1 = $t3.Current;
                                            // look for any translated words from other result
                                            var otherSources1 = System.Array.getItem(otherResult.targetWordSources, jOther1, SIL.Machine.Translation.TranslationSources);
                                            if (otherSources1 !== SIL.Machine.Translation.TranslationSources.none) {
                                                mergedTargetSegment.add(System.Array.getItem(otherResult.targetSegment, jOther1, System.String));
                                                mergedConfidences.add(System.Array.getItem(otherResult.targetWordConfidences, jOther1, System.Double));
                                                mergedSources.add(otherSources1);
                                                mergedAlignment.add({ item1: i1, item2: ((mergedTargetSegment.Count - 1) | 0) });
                                                found = true;
                                            }
                                        }
                                    } finally {
                                        if (Bridge.is($t3, System.IDisposable)) {
                                            $t3.System$IDisposable$dispose();
                                        }
                                    }
                                }
                            } finally {
                                if (Bridge.is($t2, System.IDisposable)) {
                                    $t2.System$IDisposable$dispose();
                                }
                            }
                            if (!found) {
                                // the other result had no translated words, so just use this result's target word
                                mergedTargetSegment.add(System.Array.getItem(this.targetSegment, j, System.String));
                                mergedConfidences.add(System.Array.getItem(this.targetWordConfidences, j, System.Double));
                                mergedSources.add(System.Array.getItem(this.targetWordSources, j, SIL.Machine.Translation.TranslationSources));
                                $t4 = Bridge.getEnumerator(sourceIndices);
                                try {
                                    while ($t4.moveNext()) {
                                        var i2 = $t4.Current;
                                        mergedAlignment.add({ item1: i2, item2: ((mergedTargetSegment.Count - 1) | 0) });
                                    }
                                } finally {
                                    if (Bridge.is($t4, System.IDisposable)) {
                                        $t4.System$IDisposable$dispose();
                                    }
                                }}
                        }
                    }
                }

                var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(System.Array.getCount(this.sourceSegment, System.String), mergedTargetSegment.Count);
                $t5 = Bridge.getEnumerator(mergedAlignment);
                try {
                    while ($t5.moveNext()) {
                        var t = $t5.Current;
                        alignment.setitem(t.item1, t.item2, SIL.Machine.Translation.AlignmentType.aligned);
                    }
                } finally {
                    if (Bridge.is($t5, System.IDisposable)) {
                        $t5.System$IDisposable$dispose();
                    }
                }return new SIL.Machine.Translation.TranslationResult(this.sourceSegment, mergedTargetSegment, mergedConfidences, mergedSources, alignment);
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.TranslationSources", {
        $kind: "enum",
        statics: {
            fields: {
                none: 0,
                smt: 1,
                transfer: 2,
                prefix: 4
            }
        },
        $flags: true
    });

    Bridge.define("SIL.Machine.Translation.TranslationSuggester", {
        statics: {
            methods: {
                getSuggestedWordIndices: function (prefix, isLastWordComplete, result, confidenceThreshold) {
                    return new (Bridge.GeneratorEnumerable$1(System.Int32))(Bridge.fn.bind(this, function (prefix, isLastWordComplete, result, confidenceThreshold) {
                        var $step = 0,
                            $jumpFromFinally,
                            $returnValue,
                            startingJ,
                            lookaheadCount,
                            i,
                            j,
                            sourceIndices,
                            $t,
                            ti,
                            inPhrase,
                            word,
                            confidence,
                            sources,
                            $async_e;

                        var $enumerator = new (Bridge.GeneratorEnumerator$1(System.Int32))(Bridge.fn.bind(this, function () {
                            try {
                                for (;;) {
                                    switch ($step) {
                                        case 0: {
                                            startingJ = System.Array.getCount(prefix, System.String);
                                                if (!isLastWordComplete) {
                                                    $step = 1;
                                                    continue;
                                                } 
                                                $step = 5;
                                                continue;
                                        }
                                        case 1: {
                                            // if the prefix ends with a partial word and it has been completed,
                                                // then make sure it is included as a suggestion,
                                                // otherwise, don't return any suggestions
                                                if ((System.Array.getItem(result.targetWordSources, ((startingJ - 1) | 0), SIL.Machine.Translation.TranslationSources) & SIL.Machine.Translation.TranslationSources.smt) !== 0) {
                                                    $step = 2;
                                                    continue;
                                                } else  {
                                                    $step = 3;
                                                    continue;
                                                }
                                        }
                                        case 2: {
                                            startingJ = (startingJ - 1) | 0;
                                            $step = 4;
                                            continue;
                                        }
                                        case 3: {
                                            return false;
                                        }
                                        case 4: {
                                            $step = 5;
                                            continue;
                                        }
                                        case 5: {
                                            lookaheadCount = 1;
                                                i = -1;
                                                for (j = System.Array.getCount(prefix, System.String); j < System.Array.getCount(result.targetSegment, System.String); j = (j + 1) | 0) {
                                                    sourceIndices = System.Linq.Enumerable.from(result.alignment.getColumnAlignedIndices(j)).toArray();
                                                    if (sourceIndices.length === 0) {
                                                        lookaheadCount = (lookaheadCount + 1) | 0;
                                                    } else {
                                                        lookaheadCount = (lookaheadCount + (((sourceIndices.length - 1) | 0))) | 0;
                                                        $t = Bridge.getEnumerator(sourceIndices);
                                                        try {
                                                            while ($t.moveNext()) {
                                                                ti = $t.Current;
                                                                if (i === -1 || ti < i) {
                                                                    i = ti;
                                                                }
                                                            }
                                                        } finally {
                                                            if (Bridge.is($t, System.IDisposable)) {
                                                                $t.System$IDisposable$dispose();
                                                            }
                                                        }}
                                                }
                                                if (i === -1) {
                                                    i = 0;
                                                }
                                                for (; i < System.Array.getCount(result.sourceSegment, System.String); i = (i + 1) | 0) {
                                                    if (result.alignment.isRowAligned(i) === SIL.Machine.Translation.AlignmentType.notAligned) {
                                                        lookaheadCount = (lookaheadCount + 1) | 0;
                                                    }
                                                }

                                                j = startingJ;
                                                inPhrase = false;
                                            $step = 6;
                                            continue;
                                        }
                                        case 6: {
                                            if ( j < System.Array.getCount(result.targetSegment, System.String) && (lookaheadCount > 0 || inPhrase) ) {
                                                    $step = 7;
                                                    continue;
                                                } 
                                                $step = 12;
                                                continue;
                                        }
                                        case 7: {
                                            word = System.Array.getItem(result.targetSegment, j, System.String);
                                                // stop suggesting at punctuation
                                                if (System.Linq.Enumerable.from(word).all(System.Char.isPunctuation)) {
                                                    $step = 12;
                                                    continue;
                                                }

                                                // criteria for suggesting a word
                                                // the word must either:
                                                // - meet the confidence threshold
                                                // - come from a transfer engine
                                                confidence = System.Array.getItem(result.targetWordConfidences, j, System.Double);
                                                sources = System.Array.getItem(result.targetWordSources, j, SIL.Machine.Translation.TranslationSources);
                                                if (confidence >= confidenceThreshold || (sources & SIL.Machine.Translation.TranslationSources.transfer) !== 0) {
                                                    $step = 8;
                                                    continue;
                                                } else  {
                                                    $step = 10;
                                                    continue;
                                                }
                                        }
                                        case 8: {
                                            $enumerator.current = j;
                                                $step = 9;
                                                return true;
                                        }
                                        case 9: {
                                            inPhrase = true;
                                                lookaheadCount = (lookaheadCount - 1) | 0;
                                            $step = 11;
                                            continue;
                                        }
                                        case 10: {
                                            // skip over inserted words
                                                if (result.alignment.isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.aligned) {
                                                    lookaheadCount = (lookaheadCount - 1) | 0;
                                                    // only suggest the first word/phrase we find
                                                    if (inPhrase) {
                                                        $step = 12;
                                                        continue;
                                                    }
                                                }
                                            $step = 11;
                                            continue;
                                        }
                                        case 11: {
                                            j = (j + 1) | 0;

                                                $step = 6;
                                                continue;
                                        }
                                        case 12: {

                                        }
                                        default: {
                                            return false;
                                        }
                                    }
                                }
                            } catch($async_e1) {
                                $async_e = System.Exception.create($async_e1);
                                throw $async_e;
                            }
                        }));
                        return $enumerator;
                    }, arguments));
                }
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.WordAlignmentMatrix", {
        fields: {
            _matrix: null
        },
        props: {
            rowCount: {
                get: function () {
                    return System.Array.getLength(this._matrix, 0);
                }
            },
            columnCount: {
                get: function () {
                    return System.Array.getLength(this._matrix, 1);
                }
            }
        },
        ctors: {
            $ctor1: function (i, j, defaultValue) {
                if (defaultValue === void 0) { defaultValue = 0; }

                this.$initialize();
                this._matrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, i, j);
                if (defaultValue !== SIL.Machine.Translation.AlignmentType.notAligned) {
                    this.setAll(defaultValue);
                }
            },
            ctor: function (other) {
                this.$initialize();
                this._matrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, other.rowCount, other.columnCount);
                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        this._matrix.set([i, j], other._matrix.get([i, j]));
                    }
                }
            }
        },
        methods: {
            getitem: function (i, j) {
                return this._matrix.get([i, j]);
            },
            setitem: function (i, j, value) {
                this._matrix.set([i, j], value);
            },
            setAll: function (value) {
                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        this._matrix.set([i, j], value);
                    }
                }
            },
            isRowAligned: function (i) {
                for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                    if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                        return SIL.Machine.Translation.AlignmentType.aligned;
                    }
                    if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.unknown) {
                        return SIL.Machine.Translation.AlignmentType.unknown;
                    }
                }
                return SIL.Machine.Translation.AlignmentType.notAligned;
            },
            isColumnAligned: function (j) {
                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                        return SIL.Machine.Translation.AlignmentType.aligned;
                    }
                    if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.unknown) {
                        return SIL.Machine.Translation.AlignmentType.unknown;
                    }
                }
                return SIL.Machine.Translation.AlignmentType.notAligned;
            },
            getRowAlignedIndices: function (i) {
                return new (Bridge.GeneratorEnumerable$1(System.Int32))(Bridge.fn.bind(this, function (i) {
                    var $step = 0,
                        $jumpFromFinally,
                        $returnValue,
                        j,
                        $async_e;

                    var $enumerator = new (Bridge.GeneratorEnumerator$1(System.Int32))(Bridge.fn.bind(this, function () {
                        try {
                            for (;;) {
                                switch ($step) {
                                    case 0: {
                                        j = 0;
                                            $step = 1;
                                            continue;
                                    }
                                    case 1: {
                                        if ( j < this.columnCount ) {
                                                $step = 2;
                                                continue;
                                            }
                                        $step = 7;
                                        continue;
                                    }
                                    case 2: {
                                        if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                                                $step = 3;
                                                continue;
                                            } 
                                            $step = 5;
                                            continue;
                                    }
                                    case 3: {
                                        $enumerator.current = j;
                                            $step = 4;
                                            return true;
                                    }
                                    case 4: {
                                        $step = 5;
                                        continue;
                                    }
                                    case 5: {
                                        $step = 6;
                                        continue;
                                    }
                                    case 6: {
                                        j = (j + 1) | 0;
                                        $step = 1;
                                        continue;
                                    }
                                    case 7: {

                                    }
                                    default: {
                                        return false;
                                    }
                                }
                            }
                        } catch($async_e1) {
                            $async_e = System.Exception.create($async_e1);
                            throw $async_e;
                        }
                    }));
                    return $enumerator;
                }, arguments));
            },
            getColumnAlignedIndices: function (j) {
                return new (Bridge.GeneratorEnumerable$1(System.Int32))(Bridge.fn.bind(this, function (j) {
                    var $step = 0,
                        $jumpFromFinally,
                        $returnValue,
                        i,
                        $async_e;

                    var $enumerator = new (Bridge.GeneratorEnumerator$1(System.Int32))(Bridge.fn.bind(this, function () {
                        try {
                            for (;;) {
                                switch ($step) {
                                    case 0: {
                                        i = 0;
                                            $step = 1;
                                            continue;
                                    }
                                    case 1: {
                                        if ( i < this.rowCount ) {
                                                $step = 2;
                                                continue;
                                            }
                                        $step = 7;
                                        continue;
                                    }
                                    case 2: {
                                        if (this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                                                $step = 3;
                                                continue;
                                            } 
                                            $step = 5;
                                            continue;
                                    }
                                    case 3: {
                                        $enumerator.current = i;
                                            $step = 4;
                                            return true;
                                    }
                                    case 4: {
                                        $step = 5;
                                        continue;
                                    }
                                    case 5: {
                                        $step = 6;
                                        continue;
                                    }
                                    case 6: {
                                        i = (i + 1) | 0;
                                        $step = 1;
                                        continue;
                                    }
                                    case 7: {

                                    }
                                    default: {
                                        return false;
                                    }
                                }
                            }
                        } catch($async_e1) {
                            $async_e = System.Exception.create($async_e1);
                            throw $async_e;
                        }
                    }));
                    return $enumerator;
                }, arguments));
            },
            isNeighborAligned: function (i, j) {
                if (i > 0 && this._matrix.get([((i - 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                    return true;
                }
                if (j > 0 && this._matrix.get([i, ((j - 1) | 0)]) === SIL.Machine.Translation.AlignmentType.aligned) {
                    return true;
                }
                if (i < ((this.rowCount - 1) | 0) && this._matrix.get([((i + 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                    return true;
                }
                if (j < ((this.columnCount - 1) | 0) && this._matrix.get([i, ((j + 1) | 0)]) === SIL.Machine.Translation.AlignmentType.aligned) {
                    return true;
                }
                return false;
            },
            unionWith: function (other) {
                if (this.rowCount !== other.rowCount || this.columnCount !== other.columnCount) {
                    throw new System.ArgumentException("The matrices are not the same size.", "other");
                }

                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        if (!(this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned || other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned)) {
                            this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.aligned);
                        }
                    }
                }
            },
            intersectWith: function (other) {
                if (this.rowCount !== other.rowCount || this.columnCount !== other.columnCount) {
                    throw new System.ArgumentException("The matrices are not the same size.", "other");
                }

                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        if (!(this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned && other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned)) {
                            this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.notAligned);
                        }
                    }
                }
            },
            symmetrizeWith: function (other) {
                if (this.rowCount !== other.rowCount || this.columnCount !== other.columnCount) {
                    throw new System.ArgumentException("The matrices are not the same size.", "other");
                }

                var aux = this.clone();

                this.intersectWith(other);
                var prev = null;
                while (!this.valueEquals(prev)) {
                    prev = this.clone();
                    for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                        for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                            if ((other._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned || aux._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.aligned) && this._matrix.get([i, j]) === SIL.Machine.Translation.AlignmentType.notAligned) {
                                if (this.isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.notAligned && this.isRowAligned(i) === SIL.Machine.Translation.AlignmentType.notAligned) {
                                    this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.aligned);
                                } else {
                                    if (this.isNeighborAligned(i, j)) {
                                        this._matrix.set([i, j], SIL.Machine.Translation.AlignmentType.aligned);
                                    }
                                }
                            }
                        }
                    }
                }
            },
            transpose: function () {
                var newMatrix = System.Array.create(0, null, SIL.Machine.Translation.AlignmentType, this.columnCount, this.rowCount);
                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        newMatrix.set([j, i], this._matrix.get([i, j]));
                    }
                }
                this._matrix = newMatrix;
            },
            toGizaFormat: function (sourceSegment, targetSegment) {
                var $t;
                var sb = new System.Text.StringBuilder();
                sb.appendFormat("{0}\n", Bridge.toArray(targetSegment).join(" "));

                var sourceWords = $asm.$.SIL.Machine.Translation.WordAlignmentMatrix.f1(new (System.Collections.Generic.List$1(System.String))());
                sourceWords.addRange(sourceSegment);

                var i = 0;
                $t = Bridge.getEnumerator(sourceWords);
                try {
                    while ($t.moveNext()) {
                        var sourceWord = $t.Current;
                        if (i > 0) {
                            sb.append(" ");
                        }
                        sb.append(sourceWord);
                        sb.append(" ({ ");
                        for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                            if (i === 0) {
                                if (this.isColumnAligned(j) === SIL.Machine.Translation.AlignmentType.notAligned) {
                                    sb.append(((j + 1) | 0));
                                    sb.append(" ");
                                }
                            } else if (this._matrix.get([((i - 1) | 0), j]) === SIL.Machine.Translation.AlignmentType.aligned) {
                                sb.append(((j + 1) | 0));
                                sb.append(" ");
                            }
                        }

                        sb.append("})");
                        i = (i + 1) | 0;
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }sb.append("\n");
                return sb.toString();
            },
            valueEquals: function (other) {
                if (other == null) {
                    return false;
                }

                if (this.rowCount !== other.rowCount || this.columnCount !== other.columnCount) {
                    return false;
                }

                for (var i = 0; i < this.rowCount; i = (i + 1) | 0) {
                    for (var j = 0; j < this.columnCount; j = (j + 1) | 0) {
                        if (this._matrix.get([i, j]) !== other._matrix.get([i, j])) {
                            return false;
                        }
                    }
                }
                return true;
            },
            toString: function () {
                return Bridge.toArray(System.Linq.Enumerable.range(0, this.rowCount).selectMany(Bridge.fn.bind(this, $asm.$.SIL.Machine.Translation.WordAlignmentMatrix.f2), function (item1, item2) { return { item1: item1, item2: item2 }; }).where(Bridge.fn.bind(this, $asm.$.SIL.Machine.Translation.WordAlignmentMatrix.f3)).select($asm.$.SIL.Machine.Translation.WordAlignmentMatrix.f4)).join(" ");
            },
            clone: function () {
                return new SIL.Machine.Translation.WordAlignmentMatrix.ctor(this);
            }
        }
    });

    Bridge.ns("SIL.Machine.Translation.WordAlignmentMatrix", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Translation.WordAlignmentMatrix, {
        f1: function (_o1) {
            _o1.add("NULL");
            return _o1;
        },
        f2: function (i) {
            return System.Linq.Enumerable.range(0, this.columnCount);
        },
        f3: function (t) {
            return this._matrix.get([t.item1, t.item2]) === SIL.Machine.Translation.AlignmentType.aligned;
        },
        f4: function (t) {
            return System.String.format("{0}-{1}", Bridge.box(t.item1, System.Int32), Bridge.box(t.item2, System.Int32));
        }
    });

    Bridge.define("SIL.Machine.Translation.WordGraph", {
        statics: {
            fields: {
                initialState: 0,
                smallScore: 0
            },
            ctors: {
                init: function () {
                    this.initialState = 0;
                    this.smallScore = -999999999;
                }
            }
        },
        fields: {
            _finalStates: null
        },
        props: {
            initialStateScore: 0,
            arcs: null,
            stateCount: 0,
            finalStates: {
                get: function () {
                    return this._finalStates;
                }
            },
            isEmpty: {
                get: function () {
                    return System.Array.getCount(this.arcs, SIL.Machine.Translation.WordGraphArc) === 0;
                }
            }
        },
        ctors: {
            ctor: function (arcs, finalStates, initialStateScore) {
                if (initialStateScore === void 0) { initialStateScore = 0.0; }

                this.$initialize();                var $t;

                this.arcs = System.Linq.Enumerable.from(arcs).toArray();
                var maxState = -1;
                $t = Bridge.getEnumerator(this.arcs, SIL.Machine.Translation.WordGraphArc);
                try {
                    while ($t.moveNext()) {
                        var arc = $t.Current;
                        if (arc.nextState > maxState) {
                            maxState = arc.nextState;
                        }
                        if (arc.prevState > maxState) {
                            maxState = arc.prevState;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }this.stateCount = (maxState + 1) | 0;
                this._finalStates = new (System.Collections.Generic.HashSet$1(System.Int32)).$ctor1(finalStates);
                this.initialStateScore = initialStateScore;
        }
    },
    methods: {
        computeRestScores: function () {
            var $t;
            var restScores = System.Linq.Enumerable.repeat(SIL.Machine.Translation.WordGraph.smallScore, this.stateCount).toArray(System.Double);

            $t = Bridge.getEnumerator(this._finalStates);
            try {
                while ($t.moveNext()) {
                    var state = $t.Current;
                    restScores[System.Array.index(state, restScores)] = this.initialStateScore;
                }
            } finally {
                if (Bridge.is($t, System.IDisposable)) {
                    $t.System$IDisposable$dispose();
                }
            }
            for (var i = (System.Array.getCount(this.arcs, SIL.Machine.Translation.WordGraphArc) - 1) | 0; i >= 0; i = (i - 1) | 0) {
                var arc = System.Array.getItem(this.arcs, i, SIL.Machine.Translation.WordGraphArc);

                var score = arc.score + restScores[System.Array.index(arc.nextState, restScores)];
                if (score < SIL.Machine.Translation.WordGraph.smallScore) {
                    score = SIL.Machine.Translation.WordGraph.smallScore;
                }
                if (score > restScores[System.Array.index(arc.prevState, restScores)]) {
                    restScores[System.Array.index(arc.prevState, restScores)] = score;
                }
            }

            return restScores;
        },
        computePrevScores: function (state, prevScores, stateBestPrevArcs) {
            if (this.isEmpty) {
                prevScores.v = System.Array.init(0, 0, System.Double);
                stateBestPrevArcs.v = System.Array.init(0, 0, System.Int32);
                return;
            }

            prevScores.v = System.Linq.Enumerable.repeat(SIL.Machine.Translation.WordGraph.smallScore, this.stateCount).toArray(System.Double);
            stateBestPrevArcs.v = System.Array.init(this.stateCount, 0, System.Int32);

            if (state === SIL.Machine.Translation.WordGraph.initialState) {
                prevScores.v[System.Array.index(SIL.Machine.Translation.WordGraph.initialState, prevScores.v)] = this.initialStateScore;
            } else {
                prevScores.v[System.Array.index(state, prevScores.v)] = 0;
            }

            var accessibleStates = function (_o2) {
                    _o2.add(state);
                    return _o2;
                }(new (System.Collections.Generic.HashSet$1(System.Int32)).ctor());
            for (var arcIndex = 0; arcIndex < System.Array.getCount(this.arcs, SIL.Machine.Translation.WordGraphArc); arcIndex = (arcIndex + 1) | 0) {
                var arc = System.Array.getItem(this.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);

                if (accessibleStates.contains(arc.prevState)) {
                    var score = arc.score + prevScores.v[System.Array.index(arc.prevState, prevScores.v)];
                    if (score < SIL.Machine.Translation.WordGraph.smallScore) {
                        score = SIL.Machine.Translation.WordGraph.smallScore;
                    }
                    if (score > prevScores.v[System.Array.index(arc.nextState, prevScores.v)]) {
                        prevScores.v[System.Array.index(arc.nextState, prevScores.v)] = score;
                        stateBestPrevArcs.v[System.Array.index(arc.nextState, stateBestPrevArcs.v)] = arcIndex;
                    }
                    accessibleStates.add(arc.nextState);
                } else {
                    if (!accessibleStates.contains(arc.nextState)) {
                        prevScores.v[System.Array.index(arc.nextState, prevScores.v)] = SIL.Machine.Translation.WordGraph.smallScore;
                    }
                }
            }
        },
        getBestPathFromFinalStateToState: function (state) {
            return new (Bridge.GeneratorEnumerable$1(SIL.Machine.Translation.WordGraphArc))(Bridge.fn.bind(this, function (state) {
                var $step = 0,
                    $jumpFromFinally,
                    $returnValue,
                    prevScores,
                    stateBestPredArcs,
                    bestFinalStateScore,
                    bestFinalState,
                    $t,
                    finalState,
                    score,
                    curState,
                    end,
                    arcIndex,
                    arc,
                    $async_e;

                var $enumerator = new (Bridge.GeneratorEnumerator$1(SIL.Machine.Translation.WordGraphArc))(Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            switch ($step) {
                                case 0: {
                                    prevScores = { };
                                        stateBestPredArcs = { };
                                        this.computePrevScores(state, prevScores, stateBestPredArcs);

                                        bestFinalStateScore = SIL.Machine.Translation.WordGraph.smallScore;
                                        bestFinalState = 0;
                                        $t = Bridge.getEnumerator(this._finalStates);
                                        try {
                                            while ($t.moveNext()) {
                                                finalState = $t.Current;
                                                score = prevScores.v[System.Array.index(finalState, prevScores.v)];
                                                if (bestFinalStateScore < score) {
                                                    bestFinalState = finalState;
                                                    bestFinalStateScore = score;
                                                }
                                            }
                                        } finally {
                                            if (Bridge.is($t, System.IDisposable)) {
                                                $t.System$IDisposable$dispose();
                                            }
                                        }
                                        if (!this._finalStates.contains(bestFinalState)) {
                                            $step = 1;
                                            continue;
                                        } 
                                        $step = 2;
                                        continue;
                                }
                                case 1: {
                                    return false;
                                }
                                case 2: {
                                    curState = bestFinalState;
                                        end = false;
                                    $step = 3;
                                    continue;
                                }
                                case 3: {
                                    if ( !end ) {
                                            $step = 4;
                                            continue;
                                        } 
                                        $step = 9;
                                        continue;
                                }
                                case 4: {
                                    if (curState === state) {
                                            $step = 5;
                                            continue;
                                        } else  {
                                            $step = 6;
                                            continue;
                                        }
                                }
                                case 5: {
                                    end = true;
                                    $step = 8;
                                    continue;
                                }
                                case 6: {
                                    arcIndex = stateBestPredArcs.v[System.Array.index(curState, stateBestPredArcs.v)];
                                        arc = System.Array.getItem(this.arcs, arcIndex, SIL.Machine.Translation.WordGraphArc);
                                        $enumerator.current = arc;
                                        $step = 7;
                                        return true;
                                }
                                case 7: {
                                    curState = arc.prevState;
                                    $step = 8;
                                    continue;
                                }
                                case 8: {
                                    
                                        $step = 3;
                                        continue;
                                }
                                case 9: {

                                }
                                default: {
                                    return false;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        throw $async_e;
                    }
                }));
                return $enumerator;
            }, arguments));
        }
    }
    });

    Bridge.define("SIL.Machine.Translation.WordGraphArc", {
        props: {
            prevState: 0,
            nextState: 0,
            score: 0,
            words: null,
            alignment: null,
            wordConfidences: null,
            sourceStartIndex: 0,
            sourceEndIndex: 0,
            isUnknown: false
        },
        ctors: {
            ctor: function (prevState, nextState, score, words, alignment, wordConfidences, sourceStartIndex, sourceEndIndex, isUnknown) {
                this.$initialize();
                this.prevState = prevState;
                this.nextState = nextState;
                this.score = score;
                this.words = System.Linq.Enumerable.from(words).toArray();
                this.alignment = alignment;
                this.wordConfidences = System.Linq.Enumerable.from(wordConfidences).toArray();
                this.sourceStartIndex = sourceStartIndex;
                this.sourceEndIndex = sourceEndIndex;
                this.isUnknown = isUnknown;
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Client.IHttpClient", {
        $kind: "interface"
    });

    Bridge.define("SIL.Machine.WebApi.Client.HttpException", {
        inherits: [System.Exception],
        props: {
            statusCode: 0
        },
        ctors: {
            ctor: function (message) {
                this.$initialize();
                System.Exception.ctor.call(this, message);
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Client.HttpRequestMethod", {
        $kind: "enum",
        statics: {
            fields: {
                get: 0,
                post: 1,
                put: 2,
                delete: 3
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Client.HttpResponse", {
        props: {
            isSuccess: false,
            statusCode: 0,
            content: null
        },
        ctors: {
            ctor: function (isSuccess, statusCode, content) {
                if (content === void 0) { content = null; }

                this.$initialize();
                this.isSuccess = isSuccess;
                this.statusCode = statusCode;
                this.content = content;
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Client.TranslationRestClient", {
        statics: {
            methods: {
                createModel: function (resultDto, sourceSegment) {
                    return new SIL.Machine.Translation.InteractiveTranslationResult(SIL.Machine.WebApi.Client.TranslationRestClient.createModel$3(resultDto.wordGraph), SIL.Machine.WebApi.Client.TranslationRestClient.createModel$1(resultDto.ruleResult, sourceSegment));
                },
                createModel$3: function (dto) {
                    var $t;
                    var arcs = new (System.Collections.Generic.List$1(SIL.Machine.Translation.WordGraphArc))();
                    $t = Bridge.getEnumerator(dto.arcs);
                    try {
                        while ($t.moveNext()) {
                            var arcDto = $t.Current;
                            arcs.add(new SIL.Machine.Translation.WordGraphArc(arcDto.prevState, arcDto.nextState, arcDto.score, arcDto.words, SIL.Machine.WebApi.Client.TranslationRestClient.createModel$2(arcDto.alignment, ((((arcDto.sourceEndIndex - arcDto.sourceStartIndex) | 0) + 1) | 0), arcDto.words.length), System.Linq.Enumerable.from(arcDto.confidences).select(function(x) { return Bridge.cast(x, System.Double); }), arcDto.sourceStartIndex, arcDto.sourceEndIndex, arcDto.isUnknown));
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    return new SIL.Machine.Translation.WordGraph(arcs, dto.finalStates, dto.initialStateScore);
                },
                createModel$1: function (dto, sourceSegment) {
                    if (dto == null) {
                        return null;
                    }

                    return new SIL.Machine.Translation.TranslationResult(sourceSegment, dto.target, System.Linq.Enumerable.from(dto.confidences).select(function(x) { return Bridge.cast(x, System.Double); }), dto.sources, SIL.Machine.WebApi.Client.TranslationRestClient.createModel$2(dto.alignment, System.Array.getCount(sourceSegment, System.String), dto.target.length));
                },
                createModel$2: function (dto, i, j) {
                    var $t;
                    var alignment = new SIL.Machine.Translation.WordAlignmentMatrix.$ctor1(i, j);
                    $t = Bridge.getEnumerator(dto);
                    try {
                        while ($t.moveNext()) {
                            var wordPairDto = $t.Current;
                            alignment.setitem(wordPairDto.sourceIndex, wordPairDto.targetIndex, SIL.Machine.Translation.AlignmentType.aligned);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }return alignment;
                }
            }
        },
        fields: {
            _serializerSettings: null
        },
        props: {
            projectId: null,
            baseUrl: {
                get: function () {
                    return this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$baseUrl;
                }
            },
            httpClient: null,
            errorCorrectionModel: null
        },
        ctors: {
            ctor: function (baseUrl, projectId, httpClient) {
                this.$initialize();                var $t;

                this.projectId = projectId;
                this.httpClient = httpClient;
                this.errorCorrectionModel = new SIL.Machine.Translation.ErrorCorrectionModel();
                this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$baseUrl = baseUrl;
                this._serializerSettings = ($t = new Newtonsoft.Json.JsonSerializerSettings(), $t.ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver(), $t);
        }
    },
    methods: {
        translateInteractivelyAsync: function (sourceSegment) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                url, 
                body, 
                response, 
                $t, 
                resultDto, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1], $step);
                            switch ($step) {
                                case 0: {
                                    url = System.String.format("translation/engines/project:{0}/actions/interactiveTranslate", this.projectId);
                                    body = Newtonsoft.Json.JsonConvert.SerializeObject(sourceSegment, this._serializerSettings);
                                    $task1 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.post, url, body, "application/json");
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    response = $taskResult1;
                                    if (!response.isSuccess) {
                                        throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error calling interactiveTranslate action."), $t.statusCode = response.statusCode, $t);
                                    }
                                    resultDto = Newtonsoft.Json.JsonConvert.DeserializeObject(response.content, SIL.Machine.WebApi.Dtos.InteractiveTranslationResultDto, this._serializerSettings);
                                    $tcs.setResult(SIL.Machine.WebApi.Client.TranslationRestClient.createModel(resultDto, sourceSegment));
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        trainSegmentPairAsync: function (sourceSegment, targetSegment) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                url, 
                pairDto, 
                $t, 
                body, 
                response, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1], $step);
                            switch ($step) {
                                case 0: {
                                    url = System.String.format("translation/engines/project:{0}/actions/trainSegment", this.projectId);
                                    pairDto = ($t = new SIL.Machine.WebApi.Dtos.SegmentPairDto(), $t.sourceSegment = System.Linq.Enumerable.from(sourceSegment).toArray(), $t.targetSegment = System.Linq.Enumerable.from(targetSegment).toArray(), $t);
                                    body = Newtonsoft.Json.JsonConvert.SerializeObject(pairDto, this._serializerSettings);
                                    $task1 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.post, url, body, "application/json");
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    response = $taskResult1;
                                    if (!response.isSuccess) {
                                        throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error calling trainSegment action."), $t.statusCode = response.statusCode, $t);
                                    }
                                    $tcs.setResult(null);
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        trainAsync: function (progress) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $task2, 
                $taskResult2, 
                $task3, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                engineId, 
                buildDto, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1,2,3], $step);
                            switch ($step) {
                                case 0: {
                                    $task1 = this.getEngineIdAsync();
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    engineId = $taskResult1;
                                    $task2 = this.createBuildAsync(engineId);
                                    $step = 2;
                                    $task2.continueWith($asyncBody);
                                    return;
                                }
                                case 2: {
                                    $taskResult2 = $task2.getAwaitedResult();
                                    buildDto = $taskResult2;
                                    $task3 = this.pollBuildProgressAsync(buildDto, progress);
                                    $step = 3;
                                    $task3.continueWith($asyncBody);
                                    return;
                                }
                                case 3: {
                                    $task3.getAwaitedResult();
                                    $tcs.setResult(null);
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        listenForTrainingStatus: function (progress) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $task2, 
                $taskResult2, 
                $task3, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                engineId, 
                url, 
                response, 
                $t, 
                buildDto, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1,2,3], $step);
                            switch ($step) {
                                case 0: {
                                    $task1 = this.getEngineIdAsync();
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    engineId = $taskResult1;
                                    url = System.String.format("translation/builds/engine:{0}?waitNew=true", engineId);
                                    $task2 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.get, url, void 0, void 0);
                                    $step = 2;
                                    $task2.continueWith($asyncBody);
                                    return;
                                }
                                case 2: {
                                    $taskResult2 = $task2.getAwaitedResult();
                                    response = $taskResult2;
                                    if (!response.isSuccess) {
                                        throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error getting build."), $t.statusCode = response.statusCode, $t);
                                    }
                                    buildDto = Newtonsoft.Json.JsonConvert.DeserializeObject(response.content, SIL.Machine.WebApi.Dtos.BuildDto, this._serializerSettings);
                                    $task3 = this.pollBuildProgressAsync(buildDto, progress);
                                    $step = 3;
                                    $task3.continueWith($asyncBody);
                                    return;
                                }
                                case 3: {
                                    $task3.getAwaitedResult();
                                    $tcs.setResult(null);
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        getEngineIdAsync: function () {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                url, 
                response, 
                $t, 
                engineDto, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1], $step);
                            switch ($step) {
                                case 0: {
                                    url = System.String.format("translation/engines/project:{0}", this.projectId);
                                    $task1 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.get, url, void 0, void 0);
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    response = $taskResult1;
                                    if (!response.isSuccess) {
                                        throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error getting engine identifier."), $t.statusCode = response.statusCode, $t);
                                    }
                                    engineDto = Newtonsoft.Json.JsonConvert.DeserializeObject(response.content, SIL.Machine.WebApi.Dtos.EngineDto, this._serializerSettings);
                                    $tcs.setResult(engineDto.id);
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        createBuildAsync: function (engineId) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                body, 
                response, 
                $t, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1], $step);
                            switch ($step) {
                                case 0: {
                                    body = Newtonsoft.Json.JsonConvert.SerializeObject(engineId, this._serializerSettings);
                                    $task1 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.post, "translation/builds", body, "application/json");
                                    $step = 1;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 1: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    response = $taskResult1;
                                    if (!response.isSuccess) {
                                        throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error starting build."), $t.statusCode = response.statusCode, $t);
                                    }
                                    $tcs.setResult(Newtonsoft.Json.JsonConvert.DeserializeObject(response.content, SIL.Machine.WebApi.Dtos.BuildDto, this._serializerSettings));
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        },
        pollBuildProgressAsync: function (buildDto, progress) {
            var $step = 0,
                $task1, 
                $taskResult1, 
                $jumpFromFinally, 
                $tcs = new System.Threading.Tasks.TaskCompletionSource(), 
                $returnValue, 
                url, 
                response, 
                $t, 
                $async_e, 
                $asyncBody = Bridge.fn.bind(this, function () {
                    try {
                        for (;;) {
                            $step = System.Array.min([0,1,2,3], $step);
                            switch ($step) {
                                case 0: {
                                    if ( true ) {
                                        $step = 1;
                                        continue;
                                    } 
                                    $step = 3;
                                    continue;
                                }
                                case 1: {
                                    progress(new SIL.Machine.Translation.SmtTrainProgress.$ctor1(buildDto.currentStep, buildDto.currentStepMessage, buildDto.stepCount));

                                    url = System.String.format("translation/builds/id:{0}?minRevision={1}", buildDto.id, buildDto.revision.add(System.Int64(1)));
                                    $task1 = this.httpClient.SIL$Machine$WebApi$Client$IHttpClient$sendAsync(SIL.Machine.WebApi.Client.HttpRequestMethod.get, url, void 0, void 0);
                                    $step = 2;
                                    $task1.continueWith($asyncBody);
                                    return;
                                }
                                case 2: {
                                    $taskResult1 = $task1.getAwaitedResult();
                                    response = $taskResult1;
                                    if (response.isSuccess) {
                                        buildDto = Newtonsoft.Json.JsonConvert.DeserializeObject(response.content, SIL.Machine.WebApi.Dtos.BuildDto, this._serializerSettings);
                                    } else {
                                        if (response.statusCode === 404) {
                                            $step = 3;
                                            continue;
                                        } else {
                                            throw ($t = new SIL.Machine.WebApi.Client.HttpException("Error getting build status."), $t.statusCode = response.statusCode, $t);
                                        }
                                    }

                                    $step = 0;
                                    continue;
                                }
                                case 3: {
                                    $tcs.setResult(null);
                                    return;
                                }
                                default: {
                                    $tcs.setResult(null);
                                    return;
                                }
                            }
                        }
                    } catch($async_e1) {
                        $async_e = System.Exception.create($async_e1);
                        $tcs.setException($async_e);
                    }
                }, arguments);

            $asyncBody();
            return $tcs.task;
        }
    }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.AlignedWordPairDto", {
        props: {
            sourceIndex: 0,
            targetIndex: 0
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.LinkDto", {
        props: {
            href: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.InteractiveTranslationResultDto", {
        props: {
            wordGraph: null,
            ruleResult: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.SegmentPairDto", {
        props: {
            sourceSegment: null,
            targetSegment: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.TranslationResultDto", {
        props: {
            target: null,
            confidences: null,
            sources: null,
            alignment: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.WordGraphArcDto", {
        props: {
            prevState: 0,
            nextState: 0,
            score: 0,
            words: null,
            confidences: null,
            sourceStartIndex: 0,
            sourceEndIndex: 0,
            isUnknown: false,
            alignment: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.WordGraphDto", {
        props: {
            initialStateScore: 0,
            finalStates: null,
            arcs: null
        }
    });

    Bridge.define("SIL.Machine.Annotations.IntegerSpanFactory", {
        inherits: [SIL.Machine.Annotations.SpanFactory$1(System.Int32)],
        fields: {
            _empty: null
        },
        props: {
            empty: {
                get: function () {
                    return this._empty;
                }
            }
        },
        ctors: {
            init: function () {
                this._empty = new (SIL.Machine.Annotations.Span$1(System.Int32))();
            },
            ctor: function () {
                this.$initialize();
                SIL.Machine.Annotations.SpanFactory$1(System.Int32).ctor.call(this);
                this._empty = new (SIL.Machine.Annotations.Span$1(System.Int32)).$ctor2(this, -1, -1);
            }
        },
        methods: {
            calcLength: function (start, end) {
                return ((end - start) | 0);
            },
            isRange: function (start, end) {
                return start !== end;
            },
            create$3: function (offset, dir) {
                return this.create$2(offset, ((offset + (dir === SIL.Machine.DataStructures.Direction.leftToRight ? 1 : -1)) | 0), dir);
            }
        }
    });

    Bridge.define("SIL.Machine.Tokenization.WhitespaceTokenizer", {
        inherits: [SIL.Machine.Tokenization.ITokenizer$2(System.String,System.Int32)],
        props: {
            spanFactory: null
        },
        alias: ["tokenize", ["SIL$Machine$Tokenization$ITokenizer$2$System$String$System$Int32$tokenize", "SIL$Machine$Tokenization$ITokenizer$2$tokenize"]],
        ctors: {
            ctor: function () {
                SIL.Machine.Tokenization.WhitespaceTokenizer.$ctor1.call(this, new SIL.Machine.Annotations.IntegerSpanFactory());
            },
            $ctor1: function (spanFactory) {
                this.$initialize();
                this.spanFactory = spanFactory;
            }
        },
        methods: {
            tokenize: function (data) {
                return new (Bridge.GeneratorEnumerable$1(SIL.Machine.Annotations.Span$1(System.Int32)))(Bridge.fn.bind(this, function (data) {
                    var $step = 0,
                        $jumpFromFinally,
                        $returnValue,
                        startIndex,
                        i,
                        $async_e;

                    var $enumerator = new (Bridge.GeneratorEnumerator$1(SIL.Machine.Annotations.Span$1(System.Int32)))(Bridge.fn.bind(this, function () {
                        try {
                            for (;;) {
                                switch ($step) {
                                    case 0: {
                                        startIndex = -1;
                                            i = 0;
                                            $step = 1;
                                            continue;
                                    }
                                    case 1: {
                                        if ( i < data.length ) {
                                                $step = 2;
                                                continue;
                                            }
                                        $step = 10;
                                        continue;
                                    }
                                    case 2: {
                                        if (System.Char.isWhiteSpace(String.fromCharCode(data.charCodeAt(i)))) {
                                                $step = 3;
                                                continue;
                                            } else  {
                                                $step = 7;
                                                continue;
                                            }
                                    }
                                    case 3: {
                                        if (startIndex !== -1) {
                                                $step = 4;
                                                continue;
                                            } 
                                            $step = 6;
                                            continue;
                                    }
                                    case 4: {
                                        $enumerator.current = this.spanFactory.create$1(startIndex, i);
                                            $step = 5;
                                            return true;
                                    }
                                    case 5: {
                                        $step = 6;
                                        continue;
                                    }
                                    case 6: {
                                        startIndex = -1;
                                        $step = 8;
                                        continue;
                                    }
                                    case 7: {
                                        if (startIndex === -1) {
                                                startIndex = i;
                                            }
                                        $step = 8;
                                        continue;
                                    }
                                    case 8: {
                                        $step = 9;
                                        continue;
                                    }
                                    case 9: {
                                        i = (i + 1) | 0;
                                        $step = 1;
                                        continue;
                                    }
                                    case 10: {
                                        if (startIndex !== -1) {
                                                $step = 11;
                                                continue;
                                            } 
                                            $step = 13;
                                            continue;
                                    }
                                    case 11: {
                                        $enumerator.current = this.spanFactory.create$1(startIndex, data.length);
                                            $step = 12;
                                            return true;
                                    }
                                    case 12: {
                                        $step = 13;
                                        continue;
                                    }
                                    case 13: {

                                    }
                                    default: {
                                        return false;
                                    }
                                }
                            }
                        } catch($async_e1) {
                            $async_e = System.Exception.create($async_e1);
                            throw $async_e;
                        }
                    }));
                    return $enumerator;
                }, arguments));
            }
        }
    });

    Bridge.define("SIL.Machine.Tokenization.RegexTokenizer", {
        inherits: [SIL.Machine.Tokenization.ITokenizer$2(System.String,System.Int32)],
        fields: {
            _spanFactory: null,
            _regex: null
        },
        alias: ["tokenize", ["SIL$Machine$Tokenization$ITokenizer$2$System$String$System$Int32$tokenize", "SIL$Machine$Tokenization$ITokenizer$2$tokenize"]],
        ctors: {
            $ctor1: function (regexPattern) {
                SIL.Machine.Tokenization.RegexTokenizer.ctor.call(this, new SIL.Machine.Annotations.IntegerSpanFactory(), regexPattern);
            },
            ctor: function (spanFactory, regexPattern) {
                this.$initialize();
                this._spanFactory = spanFactory;
                this._regex = new System.Text.RegularExpressions.Regex.ctor(regexPattern);
            }
        },
        methods: {
            tokenize: function (data) {
                return System.Linq.Enumerable.from(this._regex.matches(data)).select(function(x) { return Bridge.cast(x, System.Text.RegularExpressions.Match); }).select(Bridge.fn.bind(this, $asm.$.SIL.Machine.Tokenization.RegexTokenizer.f1));
            }
        }
    });

    Bridge.ns("SIL.Machine.Tokenization.RegexTokenizer", $asm.$);

    Bridge.apply($asm.$.SIL.Machine.Tokenization.RegexTokenizer, {
        f1: function (m) {
            return this._spanFactory.create$1(m.getIndex(), ((m.getIndex() + m.getLength()) | 0));
        }
    });

    Bridge.define("SIL.Machine.Tokenization.SimpleStringDetokenizer", {
        inherits: [SIL.Machine.Tokenization.IDetokenizer$2(System.String,System.String)],
        fields: {
            _operationSelector: null
        },
        alias: ["detokenize", ["SIL$Machine$Tokenization$IDetokenizer$2$System$String$System$String$detokenize", "SIL$Machine$Tokenization$IDetokenizer$2$detokenize"]],
        ctors: {
            ctor: function (operationSelector) {
                this.$initialize();
                this._operationSelector = operationSelector;
            }
        },
        methods: {
            detokenize: function (tokens) {
                var $t;
                var currentRightLeftTokens = new (System.Collections.Generic.HashSet$1(System.String)).ctor();
                var sb = new System.Text.StringBuilder();
                var nextMergeLeft = true;
                $t = Bridge.getEnumerator(tokens, System.String);
                try {
                    while ($t.moveNext()) {
                        var token = $t.Current;
                        var mergeRight = false;
                        switch (this._operationSelector(token)) {
                            case SIL.Machine.Tokenization.DetokenizeOperation.mergeLeft: 
                                nextMergeLeft = true;
                                break;
                            case SIL.Machine.Tokenization.DetokenizeOperation.mergeRight: 
                                mergeRight = true;
                                break;
                            case SIL.Machine.Tokenization.DetokenizeOperation.mergeRightFirstLeftSecond: 
                                if (currentRightLeftTokens.contains(token)) {
                                    nextMergeLeft = true;
                                    currentRightLeftTokens.remove(token);
                                } else {
                                    mergeRight = true;
                                    currentRightLeftTokens.add(token);
                                }
                                break;
                            case SIL.Machine.Tokenization.DetokenizeOperation.noOperation: 
                                break;
                        }

                        if (!nextMergeLeft) {
                            sb.append(" ");
                        } else {
                            nextMergeLeft = false;
                        }

                        sb.append(token);

                        if (mergeRight) {
                            nextMergeLeft = true;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }return sb.toString();
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.SegmentEditDistance", {
        inherits: [SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(System.String),System.String)],
        statics: {
            methods: {
                getOpCounts: function (ops, hitCount, insCount, substCount, delCount) {
                    var $t;
                    hitCount.v = 0;
                    insCount.v = 0;
                    substCount.v = 0;
                    delCount.v = 0;
                    $t = Bridge.getEnumerator(ops, SIL.Machine.Translation.EditOperation);
                    try {
                        while ($t.moveNext()) {
                            var op = $t.Current;
                            switch (op) {
                                case SIL.Machine.Translation.EditOperation.hit: 
                                    hitCount.v = (hitCount.v + 1) | 0;
                                    break;
                                case SIL.Machine.Translation.EditOperation.insert: 
                                    insCount.v = (insCount.v + 1) | 0;
                                    break;
                                case SIL.Machine.Translation.EditOperation.substitute: 
                                    substCount.v = (substCount.v + 1) | 0;
                                    break;
                                case SIL.Machine.Translation.EditOperation.delete: 
                                    delCount.v = (delCount.v + 1) | 0;
                                    break;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}
            }
        },
        fields: {
            _wordEditDistance: null
        },
        props: {
            hitCost: {
                get: function () {
                    return Bridge.ensureBaseProperty(this, "hitCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$hitCost;
                },
                set: function (value) {
                    Bridge.ensureBaseProperty(this, "hitCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$hitCost = value;
                    this._wordEditDistance.hitCost = value;
                }
            },
            substitutionCost: {
                get: function () {
                    return Bridge.ensureBaseProperty(this, "substitutionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$substitutionCost;
                },
                set: function (value) {
                    Bridge.ensureBaseProperty(this, "substitutionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$substitutionCost = value;
                    this._wordEditDistance.substitutionCost = value;
                }
            },
            insertionCost: {
                get: function () {
                    return Bridge.ensureBaseProperty(this, "insertionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$insertionCost;
                },
                set: function (value) {
                    Bridge.ensureBaseProperty(this, "insertionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$insertionCost = value;
                    this._wordEditDistance.insertionCost = value;
                }
            },
            deletionCost: {
                get: function () {
                    return Bridge.ensureBaseProperty(this, "deletionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$deletionCost;
                },
                set: function (value) {
                    Bridge.ensureBaseProperty(this, "deletionCost").$SIL$Machine$Translation$EditDistance$2$System$Collections$Generic$IReadOnlyList$1$System$String$System$String$deletionCost = value;
                    this._wordEditDistance.deletionCost = value;
                }
            }
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                SIL.Machine.Translation.EditDistance$2(System.Collections.Generic.IReadOnlyList$1(System.String),System.String).ctor.call(this);
                this._wordEditDistance = new SIL.Machine.Translation.WordEditDistance();
            }
        },
        methods: {
            computePrefix$1: function (x, y, isLastItemComplete, usePrefixDelOp, wordOps, charOps) {
                var distMatrix = { };
                var dist = this.compute$2(x, y, isLastItemComplete, usePrefixDelOp, distMatrix);

                charOps.v = null;
                var i = { v : System.Array.getCount(x, System.String) };
                var j = { v : System.Array.getCount(y, System.String) };
                var ops = new (System.Collections.Generic.Stack$1(SIL.Machine.Translation.EditOperation)).ctor();
                while (i.v > 0 || j.v > 0) {
                    var op = { v : new SIL.Machine.Translation.EditOperation() };
                    this.processMatrixCell(x, y, distMatrix.v, usePrefixDelOp, j.v !== System.Array.getCount(y, System.String) || isLastItemComplete, i.v, j.v, i, j, op);
                    if (op.v !== SIL.Machine.Translation.EditOperation.prefixDelete) {
                        ops.push(op.v);
                    }

                    if (((j.v + 1) | 0) === System.Array.getCount(y, System.String) && !isLastItemComplete && op.v === SIL.Machine.Translation.EditOperation.hit) {
                        this._wordEditDistance.computePrefix(System.Array.getItem(x, i.v, System.String), System.Array.getItem(y, ((System.Array.getCount(y, System.String) - 1) | 0), System.String), true, true, charOps);
                    }
                }

                wordOps.v = ops.toArray();
                if (charOps.v == null) {
                    charOps.v = System.Array.init(0, 0, SIL.Machine.Translation.EditOperation);
                }

                return dist;
            },
            incrComputePrefixFirstRow: function (scores, prevScores, yIncr) {
                var $t;
                if (!Bridge.referenceEquals(scores, prevScores)) {
                    System.Array.clear(scores, System.Double);
                    $t = Bridge.getEnumerator(prevScores, System.Double);
                    try {
                        while ($t.moveNext()) {
                            var score = $t.Current;
                            System.Array.add(scores, score, System.Double);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                var startPos = System.Array.getCount(scores, System.Double);
                for (var jIncr = 0; jIncr < System.Array.getCount(yIncr, System.String); jIncr = (jIncr + 1) | 0) {
                    var j = (startPos + jIncr) | 0;
                    if (j === 0) {
                        System.Array.add(scores, this.getInsertionCost(System.Array.getItem(yIncr, jIncr, System.String)), System.Double);
                    } else {
                        System.Array.add(scores, System.Array.getItem(scores, ((j - 1) | 0), System.Double) + this.getInsertionCost(System.Array.getItem(yIncr, jIncr, System.String)), System.Double);
                    }
                }
            },
            incrComputePrefix: function (scores, prevScores, xWord, yIncr, isLastItemComplete) {
                var x = System.Array.init([xWord], System.String);
                var y = System.Array.init(((System.Array.getCount(prevScores, System.Double) - 1) | 0), null, System.String);
                for (var i = 0; i < System.Array.getCount(yIncr, System.String); i = (i + 1) | 0) {
                    y[System.Array.index(((((((System.Array.getCount(prevScores, System.Double) - System.Array.getCount(yIncr, System.String)) | 0) - 1) | 0) + i) | 0), y)] = System.Array.getItem(yIncr, i, System.String);
                }

                var distMatrix = this.initDistMatrix(x, y);

                for (var j = 0; j < System.Array.getCount(prevScores, System.Double); j = (j + 1) | 0) {
                    distMatrix.set([0, j], System.Array.getItem(prevScores, j, System.Double));
                }
                for (var j1 = 0; j1 < System.Array.getCount(scores, System.Double); j1 = (j1 + 1) | 0) {
                    distMatrix.set([1, j1], System.Array.getItem(scores, j1, System.Double));
                }

                while (System.Array.getCount(scores, System.Double) < System.Array.getCount(prevScores, System.Double)) {
                    System.Array.add(scores, 0, System.Double);
                }

                var startPos = (System.Array.getCount(prevScores, System.Double) - System.Array.getCount(yIncr, System.String)) | 0;

                var ops = new (System.Collections.Generic.List$1(SIL.Machine.Translation.EditOperation))();
                for (var jIncr = 0; jIncr < System.Array.getCount(yIncr, System.String); jIncr = (jIncr + 1) | 0) {
                    var j2 = (startPos + jIncr) | 0;
                    var iPred = { }, jPred = { };
                    var op = { v : new SIL.Machine.Translation.EditOperation() };
                    var dist = this.processMatrixCell(x, y, distMatrix, false, j2 !== y.length || isLastItemComplete, 1, j2, iPred, jPred, op);
                    System.Array.setItem(scores, j2, dist, System.Double);
                    distMatrix.set([1, j2], dist);
                    ops.add(op.v);
                }

                return ops;
            },
            getCount: function (item) {
                return System.Array.getCount(item, System.String);
            },
            getItem: function (seq, index) {
                return System.Array.getItem(seq, index, System.String);
            },
            getHitCost: function (x, y, isComplete) {
                return this.hitCost * y.length;
            },
            getSubstitutionCost: function (x, y, isComplete) {
                if (Bridge.referenceEquals(x, "")) {
                    return (this.substitutionCost * 0.99) * y.length;
                }

                var ops = { };
                if (isComplete) {
                    this._wordEditDistance.compute$1(x, y, ops);
                } else {
                    this._wordEditDistance.computePrefix(x, y, true, true, ops);
                }

                var hitCount = { }, insCount = { }, substCount = { }, delCount = { };
                SIL.Machine.Translation.SegmentEditDistance.getOpCounts(ops.v, hitCount, insCount, substCount, delCount);

                return (this.hitCost * hitCount.v) + (this.insertionCost * insCount.v) + (this.substitutionCost * substCount.v) + (this.deletionCost * delCount.v);
            },
            getDeletionCost: function (x) {
                if (Bridge.referenceEquals(x, "")) {
                    return this.deletionCost;
                }
                return this.deletionCost * x.length;
            },
            getInsertionCost: function (y) {
                return this.insertionCost * y.length;
            },
            isHit: function (x, y, isComplete) {
                return Bridge.referenceEquals(x, y) || (!isComplete && System.String.startsWith(x, y));
            }
        }
    });

    Bridge.define("SIL.Machine.Translation.WordEditDistance", {
        inherits: [SIL.Machine.Translation.EditDistance$2(System.String,System.Char)],
        methods: {
            getCount: function (item) {
                return item.length;
            },
            getItem: function (seq, index) {
                return seq.charCodeAt(index);
            },
            getHitCost: function (x, y, isComplete) {
                return this.hitCost;
            },
            getSubstitutionCost: function (x, y, isComplete) {
                return this.substitutionCost;
            },
            getDeletionCost: function (x) {
                return this.deletionCost;
            },
            getInsertionCost: function (y) {
                return this.insertionCost;
            },
            isHit: function (x, y, isComplete) {
                return x === y;
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Client.AjaxHttpClient", {
        inherits: [SIL.Machine.WebApi.Client.IHttpClient],
        props: {
            baseUrl: null
        },
        alias: [
            "baseUrl", "SIL$Machine$WebApi$Client$IHttpClient$baseUrl",
            "sendAsync", "SIL$Machine$WebApi$Client$IHttpClient$sendAsync"
        ],
        methods: {
            sendAsync: function (method, url, body, contentType) {
                if (body === void 0) { body = null; }
                if (contentType === void 0) { contentType = null; }
                var tcs = new System.Threading.Tasks.TaskCompletionSource();
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState !== 4) {
                        return;
                    }

                    if ((request.status >= 200 && request.status < 300) || request.status === 304) {
                        tcs.setResult(new SIL.Machine.WebApi.Client.HttpResponse(true, request.status, request.responseText));
                    } else {
                        tcs.setResult(new SIL.Machine.WebApi.Client.HttpResponse(false, request.status));
                    }
                };

                var methodStr;
                switch (method) {
                    case SIL.Machine.WebApi.Client.HttpRequestMethod.get: 
                        methodStr = "GET";
                        break;
                    case SIL.Machine.WebApi.Client.HttpRequestMethod.post: 
                        methodStr = "POST";
                        break;
                    case SIL.Machine.WebApi.Client.HttpRequestMethod.delete: 
                        methodStr = "DELETE";
                        break;
                    case SIL.Machine.WebApi.Client.HttpRequestMethod.put: 
                        methodStr = "PUT";
                        break;
                    default: 
                        throw new System.ArgumentException("Unrecognized HTTP method.", "method");
                }

                request.open(methodStr, System.String.concat(this.baseUrl, url));
                if (contentType != null) {
                    request.setRequestHeader("Content-Type", contentType);
                }
                if (body == null) {
                    request.send();
                } else {
                    request.send(body);
                }
                return tcs.task;
            }
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.BuildDto", {
        inherits: [SIL.Machine.WebApi.Dtos.LinkDto],
        props: {
            id: null,
            revision: System.Int64(0),
            engine: null,
            stepCount: 0,
            currentStep: 0,
            currentStepMessage: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.EngineDto", {
        inherits: [SIL.Machine.WebApi.Dtos.LinkDto],
        props: {
            id: null,
            sourceLanguageTag: null,
            targetLanguageTag: null,
            isShared: false,
            projects: null
        }
    });

    Bridge.define("SIL.Machine.WebApi.Dtos.ProjectDto", {
        inherits: [SIL.Machine.WebApi.Dtos.LinkDto],
        props: {
            id: null,
            isShared: false,
            sourceLanguageTag: null,
            targetLanguageTag: null,
            engine: null
        }
    });

    Bridge.define("SIL.Machine.Tokenization.LatinWordTokenizer", {
        inherits: [SIL.Machine.Tokenization.WhitespaceTokenizer],
        fields: {
            _innerWordPunctRegex: null,
            _abbreviations: null
        },
        alias: ["tokenize", ["SIL$Machine$Tokenization$ITokenizer$2$System$String$System$Int32$tokenize", "SIL$Machine$Tokenization$ITokenizer$2$tokenize"]],
        ctors: {
            init: function () {
                this._innerWordPunctRegex = new System.Text.RegularExpressions.Regex.ctor("\\G[&'\\-.:=?@­·‐‑’‧]|_+");
            },
            ctor: function () {
                SIL.Machine.Tokenization.LatinWordTokenizer.$ctor1.call(this, new SIL.Machine.Annotations.IntegerSpanFactory());
            },
            $ctor3: function (abbreviations) {
                SIL.Machine.Tokenization.LatinWordTokenizer.$ctor2.call(this, new SIL.Machine.Annotations.IntegerSpanFactory(), abbreviations);
            },
            $ctor1: function (spanFactory) {
                SIL.Machine.Tokenization.LatinWordTokenizer.$ctor2.call(this, spanFactory, System.Linq.Enumerable.empty());
            },
            $ctor2: function (spanFactory, abbreviations) {
                this.$initialize();
                SIL.Machine.Tokenization.WhitespaceTokenizer.$ctor1.call(this, spanFactory);
                this._abbreviations = new (System.Collections.Generic.HashSet$1(System.String)).$ctor1(System.Linq.Enumerable.from(abbreviations).select(Bridge.fn.cacheBind(this, this.toLower)));
            }
        },
        methods: {
            tokenize: function (data) {
                return new (Bridge.GeneratorEnumerable$1(SIL.Machine.Annotations.Span$1(System.Int32)))(Bridge.fn.bind(this, function (data) {
                    var $step = 0,
                        $jumpFromFinally,
                        $returnValue,
                        $t,
                        span,
                        wordStart,
                        innerWordPunct,
                        i,
                        match,
                        $async_e;

                    var $enumerator = new (Bridge.GeneratorEnumerator$1(SIL.Machine.Annotations.Span$1(System.Int32)))(Bridge.fn.bind(this, function () {
                        try {
                            for (;;) {
                                switch ($step) {
                                    case 0: {
                                        $t = Bridge.getEnumerator(SIL.Machine.Tokenization.WhitespaceTokenizer.prototype.tokenize.call(this, data), SIL.Machine.Annotations.Span$1(System.Int32));
                                            $step = 1;
                                            continue;
                                    }
                                    case 1: {
                                        if ($t.moveNext()) {
                                                span = $t.Current;
                                                $step = 2;
                                                continue;
                                            }
                                        $step = 32;
                                        continue;
                                    }
                                    case 2: {
                                        wordStart = -1;
                                            innerWordPunct = -1;
                                            i = span.start;
                                        $step = 3;
                                        continue;
                                    }
                                    case 3: {
                                        if ( i < span.end ) {
                                                $step = 4;
                                                continue;
                                            } 
                                            $step = 19;
                                            continue;
                                    }
                                    case 4: {
                                        if (this.isPunctuation(data.charCodeAt(i)) || System.Char.isSymbol(data.charCodeAt(i)) || System.Char.isControl(data.charCodeAt(i))) {
                                                $step = 5;
                                                continue;
                                            } else  {
                                                $step = 17;
                                                continue;
                                            }
                                    }
                                    case 5: {
                                        if (wordStart === -1) {
                                                $step = 6;
                                                continue;
                                            } else  {
                                                $step = 8;
                                                continue;
                                            }
                                    }
                                    case 6: {
                                        $enumerator.current = this.spanFactory.create(i);
                                            $step = 7;
                                            return true;
                                    }
                                    case 7: {
                                        $step = 16;
                                        continue;
                                    }
                                    case 8: {
                                        if (innerWordPunct !== -1) {
                                                $step = 9;
                                                continue;
                                            } else  {
                                                $step = 12;
                                                continue;
                                            }
                                    }
                                    case 9: {
                                        $enumerator.current = this.spanFactory.create$1(wordStart, innerWordPunct);
                                            $step = 10;
                                            return true;
                                    }
                                    case 10: {
                                        $enumerator.current = this.spanFactory.create$1(innerWordPunct, i);
                                            $step = 11;
                                            return true;
                                    }
                                    case 11: {
                                        $step = 15;
                                        continue;
                                    }
                                    case 12: {
                                        match = this._innerWordPunctRegex.match(data, i);
                                            if (match.getSuccess()) {
                                                innerWordPunct = i;
                                                i = (i + match.getLength()) | 0;
                                                $step = 3;
                                                continue;
                                            }

                                            $enumerator.current = this.spanFactory.create$1(wordStart, i);
                                            $step = 13;
                                            return true;
                                    }
                                    case 13: {
                                        $enumerator.current = this.spanFactory.create(i);
                                            $step = 14;
                                            return true;
                                    }
                                    case 14: {
                                        $step = 15;
                                        continue;
                                    }
                                    case 15: {
                                        $step = 16;
                                        continue;
                                    }
                                    case 16: {
                                        wordStart = -1;
                                        $step = 18;
                                        continue;
                                    }
                                    case 17: {
                                        if (wordStart === -1) {
                                                wordStart = i;
                                            }
                                        $step = 18;
                                        continue;
                                    }
                                    case 18: {
                                        innerWordPunct = -1;
                                            i = (i + 1) | 0;

                                            $step = 3;
                                            continue;
                                    }
                                    case 19: {
                                        if (wordStart !== -1) {
                                                $step = 20;
                                                continue;
                                            } 
                                            $step = 31;
                                            continue;
                                    }
                                    case 20: {
                                        if (innerWordPunct !== -1) {
                                                $step = 21;
                                                continue;
                                            } else  {
                                                $step = 28;
                                                continue;
                                            }
                                    }
                                    case 21: {
                                        if (Bridge.referenceEquals(data.substr(innerWordPunct, ((span.end - innerWordPunct) | 0)), ".") && this._abbreviations.contains(this.toLower(data.substr(wordStart, ((innerWordPunct - wordStart) | 0))))) {
                                                $step = 22;
                                                continue;
                                            } else  {
                                                $step = 24;
                                                continue;
                                            }
                                    }
                                    case 22: {
                                        $enumerator.current = this.spanFactory.create$1(wordStart, span.end);
                                            $step = 23;
                                            return true;
                                    }
                                    case 23: {
                                        $step = 27;
                                        continue;
                                    }
                                    case 24: {
                                        $enumerator.current = this.spanFactory.create$1(wordStart, innerWordPunct);
                                            $step = 25;
                                            return true;
                                    }
                                    case 25: {
                                        $enumerator.current = this.spanFactory.create$1(innerWordPunct, span.end);
                                            $step = 26;
                                            return true;
                                    }
                                    case 26: {
                                        $step = 27;
                                        continue;
                                    }
                                    case 27: {
                                        $step = 30;
                                        continue;
                                    }
                                    case 28: {
                                        $enumerator.current = this.spanFactory.create$1(wordStart, span.end);
                                            $step = 29;
                                            return true;
                                    }
                                    case 29: {
                                        $step = 30;
                                        continue;
                                    }
                                    case 30: {
                                        $step = 31;
                                        continue;
                                    }
                                    case 31: {
                                        $step = 1;
                                        continue;
                                    }
                                    case 32: {

                                    }
                                    default: {
                                        return false;
                                    }
                                }
                            }
                        } catch($async_e1) {
                            $async_e = System.Exception.create($async_e1);
                            throw $async_e;
                        }
                    }));
                    return $enumerator;
                }, arguments));
            },
            toLower: function (str) {
                return str.toLowerCase();
            },
            isPunctuation: function (c) {
                if (c < 256) {
                    return System.Char.isPunctuation(c);
                }
                // this is a horrible workaround for a bug in Bridge.NET, see issue #2981
                return System.Text.RegularExpressions.Regex.isMatch(String.fromCharCode(c), "[;·՚-՟։֊־׀׃׆׳״؉؊،؍؛؞؟٪-٭۔܀-܍߷-߹࠰-࠾࡞।॥॰૰෴๏๚๛༄-༒༔༺-༽྅࿐-࿔࿙࿚၊-၏჻፠-፨᐀᙭᙮᚛᚜᛫-᛭᜵᜶។-៖៘-៚᠀-᠊᥄᥅᨞᨟᪠-᪦᪨-᪭᭚-᭠᯼-᯿᰻-᰿᱾᱿᳀-᳇᳓‐-‧‰-⁃⁅-⁑⁓-⁞⁽⁾₍₎〈〉❨-❵⟅⟆⟦-⟯⦃-⦘⧘-⧛⧼⧽⳹-⳼⳾⳿⵰⸀-⸮⸰-⸻、-〃〈-】〔-〟〰〽゠・꓾꓿꘍-꘏꙳꙾꛲-꛷꡴-꡷꣎꣏꣸-꣺꤮꤯꥟꧁-꧍꧞꧟꩜-꩟꫞꫟꫰꫱꯫﴾﴿︐-︙︰-﹒﹔-﹡﹣﹨﹪﹫！-＃％-＊，-／：；？＠［-］＿｛｝｟-･֊־᐀᠆‐-―⸗⸚⸺⸻〜〰゠︱︲﹘﹣－༺༼᚛‚„⁅⁽₍〈❨❪❬❮❰❲❴⟅⟦⟨⟪⟬⟮⦃⦅⦇⦉⦋⦍⦏⦑⦓⦕⦗⧘⧚⧼⸢⸤⸦⸨〈《「『【〔〖〘〚〝﴾︗︵︷︹︻︽︿﹁﹃﹇﹙﹛﹝（［｛｟｢༻༽᚜⁆⁾₎〉❩❫❭❯❱❳❵⟆⟧⟩⟫⟭⟯⦄⦆⦈⦊⦌⦎⦐⦒⦔⦖⦘⧙⧛⧽⸣⸥⸧⸩〉》」』】〕〗〙〛〞〟﴿︘︶︸︺︼︾﹀﹂﹄﹈﹚﹜﹞）］｝｠｣‘‛“‟‹⸂⸄⸉⸌⸜⸠’”›⸃⸅⸊⸍⸝⸡‿⁀⁔︳︴﹍-﹏＿;·՚-՟։׀׃׆׳״؉؊،؍؛؞؟٪-٭۔܀-܍߷-߹࠰-࠾࡞।॥॰૰෴๏๚๛༄-༒༔྅࿐-࿔࿙࿚၊-၏჻፠-፨᙭᙮᛫-᛭᜵᜶។-៖៘-៚᠀-᠅᠇-᠊᥄᥅᨞᨟᪠-᪦᪨-᪭᭚-᭠᯼-᯿᰻-᰿᱾᱿᳀-᳇᳓‖‗†-‧‰-‸※-‾⁁-⁃⁇-⁑⁓⁕-⁞⳹-⳼⳾⳿⵰⸀⸁⸆-⸈⸋⸎-⸖⸘⸙⸛⸞⸟⸪-⸮⸰-⸹、-〃〽・꓾꓿꘍-꘏꙳꙾꛲-꛷꡴-꡷꣎꣏꣸-꣺꤮꤯꥟꧁-꧍꧞꧟꩜-꩟꫞꫟꫰꫱꯫︐-︖︙︰﹅﹆﹉-﹌﹐-﹒﹔-﹗﹟-﹡﹨﹪﹫！-＃％-＇＊，．／：；？＠＼｡､･]");
            }
        }
    });
});

import { CategoryName } from "@/interface/category.interface";
import { ManufacturerName } from "@/interface/manufacturer.interface";
import { ProductFilter } from "@/interface/Product";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { use, useEffect, useState } from "react"
interface Props {
    categories: CategoryName[];
    manufacturer: ManufacturerName[];
    setFilter: (filter: ProductFilter) => void
    fetchData: () => void
    filter: ProductFilter
}
const ProductFilterTaskbar = ({ filter, categories, manufacturer, setFilter }: Props) => {
    const [selectedCategory, setSelectedCategory] = useState<number>(filter.categoryId ?? -1)
    const [selectedManufacturer, setSelectedManufacturer] = useState<number>(filter.manufacturerId ?? -1)
    const [productName, setProductName] = useState<string>(filter.name ?? "")
    const [usedFilter, setUsedFilter] = useState(false)
    const flattenCategoriesWithNames = (
        category: CategoryName,
        parentName: string = ""
    ): { id: number; name: string }[] => {
        const fullName = parentName ? `${parentName}>>>${category.name}` : category.name;
        const result = [{ id: category.id, name: fullName }];

        if (category.children) {
            for (const child of category.children) {
                result.push(...flattenCategoriesWithNames(child, fullName));
            }
        }

        return result;
    };
    const convertCategoriesToList = () => {
        const listNameCategory = categories.flatMap(category =>
            flattenCategoriesWithNames(category)
        );
        return listNameCategory;
    }
    const validateFilter = () => {
        if (productName === '' && selectedCategory === -1 && selectedManufacturer === -1) return false;
        return true;
    }
    const handleFilter = () => {
        if (validateFilter()) {
            setUsedFilter(true)
            setFilter({
                ...filter,
                ...(productName !== '' ? { name: productName } : {}),
                ...(selectedCategory !== -1 ? { categoryId: selectedCategory } : {}),
                ...(selectedManufacturer !== -1 ? { manufacturerId: selectedManufacturer } : {}),
            });
        }
    }
    const cancelFilter = () => {
        setUsedFilter(false)
        setFilter({});
    }

    useEffect(() => {
        setSelectedCategory(filter.categoryId ?? -1)
        setSelectedManufacturer(filter.manufacturerId ?? -1)
        setProductName(filter.name ?? "")
    }, [filter])
    const optionsWithAllCategory = [
        { value: -1, label: "Tất Cả" },
        ...convertCategoriesToList().map((category) => ({
            value: category.id,
            label: category.name,
        }))
    ];
    const optionsWithAllManufacturer = [
        { value: -1, label: "Tất Cả" },
        ...manufacturer.map((item) => ({
            value: item.id,
            label: item.manufacturerName,
        }))
    ];
    return (
        <>

            <Accordion activeIndex={1}>
                <AccordionTab header="Lọc">
                    <div className="card   rounded-lg p-4 space-y-4">
                        <div className="flex flex-row">
                            <div className="flex flex-col space-y-2 w-1/3 mr-8">
                                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                                    Danh Mục
                                </label>
                                <Dropdown
                                    id="category"
                                    className="w-full"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.value)}
                                    options={optionsWithAllCategory}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 w-1/3">
                                <label htmlFor="productName" className="text-sm font-medium text-gray-700">
                                    Product Name
                                </label>
                                <InputText
                                    id="Tên Sản Phẩm"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-2 w-1/3">
                            <label htmlFor="manufacturer" className="text-sm font-medium text-gray-700">
                                Nhà Sản Xuất
                            </label>
                            <Dropdown
                                id="manufacturer"
                                className="w-full"
                                value={selectedManufacturer}
                                onChange={(e) => setSelectedManufacturer(e.value)}
                                options={optionsWithAllManufacturer}
                            />
                        </div>
                        {!usedFilter ? (
                            <Button label="Lọc" icon='pi pi-search' onClick={handleFilter} />
                        ) : (
                            <Button label="Lọc" icon='pi pi-times' onClick={cancelFilter} />
                        )}
                    </div>
                </AccordionTab>
            </Accordion>
        </>
    )
}

export default ProductFilterTaskbar;